import re
import requests
import xml.etree.ElementTree as ET
from flask import current_app
from api.isbn import isbn_from_query, isbn10_to_isbn13, isbn_lookup_values

DNB_SRU_URL = "https://services.dnb.de/sru/dnb"
DNB_COVER_URL = "https://portal.dnb.de/opac/mvb/cover"
MARC_NS = {"marc": "http://www.loc.gov/MARC21/slim"}

class BookProvider:
    def __init__(self):
        
        self.primary_provider = current_app.config.get("DATA_PROVIDER").strip().lower()
        self.fallback_provider = current_app.config.get("DATA_PROVIDER_FALLBACK").strip().lower()

        # Session configuration for connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "BookLogr (mozzo242@gmail.com)",
            "Accept": "application/json"
        })

    def search(self, query):
        try:
            return self._fetch_search(self.primary_provider, query)
        except Exception as e:
            print(f"Primary search provider {self.primary_provider} failed: {e}")
            try:
                return self._fetch_search(self.fallback_provider, query)
            except Exception as e:
                print(f"Fallback search provider {self.fallback_provider} failed: {e}")
                return None
        
    def get(self, isbn):
        try:
            return self._fetch_get(self.primary_provider, isbn)
        except Exception as e:
            print(f"Primary search provider {self.primary_provider} failed: {e}")
            try:
                return self._fetch_get(self.fallback_provider, isbn)
            except Exception as e:
                print(f"Fallback search provider {self.fallback_provider} failed: {e}")
                return None
    
    def _fetch_search(self, provider, query):
        if provider == "openlibrary":
            return self._search_openlibrary(query)
        elif provider == "dnb":
            return self._search_dnb(query)
        else:
            return self._search_booklogr_api(provider, query)

    def _fetch_get(self, provider, isbn):
        if provider == "openlibrary":
            return self._get_openlibrary(isbn)
        elif provider == "dnb":
            return self._get_dnb(isbn)
        else:
            return self._get_booklogr_api(provider, isbn)


    def _search_openlibrary(self, query):
        """Fetcher for the standard OpenLibrary API"""
        params = {
            "q": query,
            "limit": 10,
            "fields": "title,isbn,author_name",
            "lang": "en"
        }
        resp = self.session.get("https://openlibrary.org/search.json", params=params, timeout=30)
        resp.raise_for_status()
        
        docs = resp.json().get("docs", [])
        normalized = []
        for doc in docs:
            isbns = doc.get("isbn", [])
            if not isbns: continue
            normalized.append({
                "isbn": isbns[0],
                "title": doc.get("title"),
                "author": doc.get("author_name")[0] if doc.get("author_name") else "Unknown"
            })
        return normalized

    def _search_booklogr_api(self, url, query):
        """Fetcher for the custom sqlite-based search.booklogr.app API"""
        base_url = url if url.startswith("http") else "https://metadata.booklogr.app"

        normalized_query = isbn_from_query(query) or query
        endpoint = f"{base_url.rstrip('/')}/v1/search/{requests.utils.quote(normalized_query)}"
        params = {"limit": 10, "sort": "relevance"}
        print(endpoint)
        
        resp = self.session.get(endpoint, params=params, timeout=30)
        resp.raise_for_status()
        
        data = resp.json()
        if isinstance(data, dict) and "message" in data: # Handle 404 "Not found"
            return []

        normalized = []
        for row in data:
            # Prefer ISBN-13, fallback to ISBN-10
            isbn13 = row.get("isbn_13", [])
            isbn10 = row.get("isbn_10", [])
            isbn = isbn13[0] if isbn13 else (isbn10[0] if isbn10 else None)
            
            if not isbn: continue
            
            authors = row.get("author_names", [])
            normalized.append({
                "isbn": isbn,
                "title": row.get("title"),
                "author": authors[0] if authors else "Unknown"
            })
        return normalized
    
    def _get_openlibrary(self, isbn):
        base = "https://openlibrary.org"
        resp = self.session.get(f"{base}/isbn/{isbn}.json", timeout=30)
        if resp.status_code != 200:
            return None
        
        ol_data = resp.json()
        
        author_name = "Unknown"
        if ol_data.get("authors"):
            auth_key = ol_data["authors"][0].get("key")
            a_resp = self.session.get(f"{base}{auth_key}.json", timeout=30)
            if a_resp.status_code == 200:
                author_name = a_resp.json().get("name", "Unknown")

        description = ol_data.get("description")
        if not description and ol_data.get("works"):
            work_key = ol_data["works"][0].get("key")
            w_resp = self.session.get(f"{base}{work_key}.json", timeout=30)
            if w_resp.status_code == 200:
                description = w_resp.json().get("description")

        if isinstance(description, dict):
            description = description.get("value")

        return {
            "title": ol_data.get("title"),
            "subtitle": ol_data.get("subtitle"),
            "author": author_name,
            "description": description,
            "total_pages": ol_data.get("number_of_pages", 0)
        }
    
    def _get_booklogr_api(self, url, isbn):
        base_url = url if url.startswith("http") else "https://metadata.booklogr.app"
        
        ed_resp = self.session.get(f"{base_url.rstrip('/')}/v1/edition/{isbn}", timeout=30)
        if ed_resp.status_code != 200:
            return None
        
        ed_data = ed_resp.json()
        
        authors = ed_data.get("author_names", [])
        author_name = authors[0] if (isinstance(authors, list) and len(authors) > 0) else "Unknown"

        description = ""
        work_ids = ed_data.get("work_ids", [])
        if work_ids:
            work_id = work_ids[0].replace("/works/", "")
            w_resp = self.session.get(f"{base_url.rstrip('/')}/v1/work/{work_id}", timeout=30)
            if w_resp.status_code == 200:
                work_data = w_resp.json()
                description = work_data.get("description", "")
                if isinstance(description, dict):
                    description = description.get("value")

        return {
            "title": ed_data.get("title"),
            "subtitle": ed_data.get("subtitle"),
            "author": author_name,
            "description": description,
            "total_pages": ed_data.get("number_of_pages", 0)
        }

    def _search_dnb(self, query):
        """Fetcher for the German National Library (DNB) SRU API"""
        isbn = isbn_from_query(query)
        if isbn:
            records = self._fetch_dnb_records(f"NUM={isbn}", maximum_records=10)
        else:
            escaped_query = query.replace('"', "")
            cql_query = f'tit="{escaped_query}" OR per="{escaped_query}"'
            records = self._fetch_dnb_records(cql_query, maximum_records=10)

        normalized = []
        seen_isbns = set()
        for record in records:
            parsed = self._parse_dnb_record(record)
            if not parsed["isbn"] or parsed["isbn"] in seen_isbns:
                continue
            seen_isbns.add(parsed["isbn"])
            normalized.append({
                "isbn": parsed["isbn"],
                "title": parsed["title"],
                "author": parsed["author"]
            })
        return normalized

    def _get_dnb(self, isbn):
        lookup_values = isbn_lookup_values(isbn)
        for candidate in lookup_values:
            records = self._fetch_dnb_records(f"NUM={candidate}", maximum_records=1)
            if not records:
                continue

            parsed = self._parse_dnb_record(records[0])
            if not parsed["title"]:
                continue

            # The DNB NUM index can return near matches for invalid or
            # placeholder ISBNs, so only accept a record that actually
            # carries one of the requested ISBN values.
            if parsed["isbn"] not in lookup_values:
                continue

            return {
                "title": parsed["title"],
                "subtitle": parsed["subtitle"],
                "author": parsed["author"],
                "description": parsed["description"],
                "total_pages": parsed["total_pages"],
                "isbn": parsed["isbn"],
                "publisher": parsed["publisher"],
                "published_year": parsed["published_year"],
                "cover_url": parsed["cover_url"]
            }
        return None

    def _fetch_dnb_records(self, cql_query, maximum_records=10):
        """Run a searchRetrieve request against the DNB SRU interface.

        The SRU interface of the DNB catalogue is free to use and does not
        require an access token. Results are returned as MARC21-xml records.
        """
        params = {
            "version": "1.1",
            "operation": "searchRetrieve",
            "query": cql_query,
            "recordSchema": "MARC21-xml",
            "maximumRecords": maximum_records
        }
        resp = self.session.get(DNB_SRU_URL, params=params, timeout=30)
        resp.raise_for_status()

        root = ET.fromstring(resp.content)
        return root.findall(".//marc:record", MARC_NS)

    def _parse_dnb_record(self, record):
        def subfields(tag, code):
            values = []
            for field in record.findall(f"marc:datafield[@tag='{tag}']", MARC_NS):
                for sub in field.findall(f"marc:subfield[@code='{code}']", MARC_NS):
                    if sub.text and sub.text.strip():
                        values.append(sub.text.strip())
            return values

        def subfield(tag, code):
            values = subfields(tag, code)
            return values[0] if values else None

        def clean_text(value):
            # MARC records wrap non-sorting words (e.g. leading articles) in
            # U+0098/U+009C control characters; they are not printable text.
            if value:
                value = value.replace("\u0098", "").replace("\u009c", "")
            return value

        # ISBNs live in field 020 $a, sometimes followed by a price/qualifier note
        isbn = None
        for raw_isbn in subfields("020", "a"):
            cleaned = re.sub(r"[^0-9Xx]", "", raw_isbn.split(" ")[0]).upper()
            if len(cleaned) == 13:
                isbn = cleaned
                break
            if len(cleaned) == 10 and isbn is None:
                isbn = isbn10_to_isbn13(cleaned) or cleaned

        # Authors: 100 $a is the main author, 700 $a holds additional authors
        authors = []
        for name in subfields("100", "a") + subfields("700", "a"):
            name = clean_text(name).rstrip(",").strip()
            if name and name not in authors:
                authors.append(name)

        title = subfield("245", "a")
        if title:
            title = clean_text(title).rstrip(" /:;").strip()
        subtitle = subfield("245", "b")
        if subtitle:
            subtitle = clean_text(subtitle).rstrip(" /:;").strip()

        # Publisher and year: 264 (RDA) or the older 260 (AACR2), $b = publisher, $c = year
        publisher = subfield("264", "b") or subfield("260", "b")
        if publisher:
            publisher = clean_text(publisher).rstrip(" ,;").strip()
        published = subfield("264", "c") or subfield("260", "c") or ""
        year_match = re.search(r"\d{4}", published)
        published_year = int(year_match.group(0)) if year_match else None

        # Physical description 300 $a, e.g. "335 S." or "192 Seiten"
        total_pages = 0
        extent = subfield("300", "a")
        if extent:
            pages_match = re.match(r"\s*(\d+)", extent)
            if pages_match:
                total_pages = int(pages_match.group(1))

        return {
            "isbn": isbn,
            "title": title,
            "subtitle": subtitle,
            "author": authors[0] if authors else "Unknown",
            "description": clean_text(subfield("520", "a")),
            "total_pages": total_pages,
            "publisher": publisher,
            "published_year": published_year,
            "cover_url": f"{DNB_COVER_URL}?isbn={isbn}" if isbn else None
        }