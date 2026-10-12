import requests
from flask import current_app
from api.isbn import isbn_from_query
from api.identifiers import OL_EDITION_RE, normalize_olid

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
        if OL_EDITION_RE.fullmatch(query.strip()):
            book = self.get(normalize_olid(query))
            return [book] if book else []
        try:
            return self._fetch_search(self.primary_provider, query)
        except Exception as e:
            print(f"Primary search provider {self.primary_provider} failed: {e}")
            try:
                return self._fetch_search(self.fallback_provider, query)
            except Exception as e:
                print(f"Fallback search provider {self.fallback_provider} failed: {e}")
                return None
        
    def get(self, identifier):
        identifier = identifier.strip()
        if identifier.upper().startswith("OL"):
            if not OL_EDITION_RE.fullmatch(identifier):
                return None
            identifier = normalize_olid(identifier)
        for provider in dict.fromkeys((self.primary_provider, self.fallback_provider)):
            try:
                result = self._fetch_get(provider, identifier)
                if result is not None:
                    return result
            except requests.RequestException as error:
                print(f"Metadata provider {provider} failed: {error}")
        return None

    def _fetch_search(self, provider, query):
        if provider == "openlibrary":
            return self._search_openlibrary(query)
        else:
            return self._search_booklogr_api(provider, query)
        
    def _fetch_get(self, provider, isbn):
        if provider == "openlibrary":
            return self._get_openlibrary(isbn)
        else:
            return self._get_booklogr_api(provider, isbn)


    def _search_openlibrary(self, query):
        """Fetcher for the standard OpenLibrary API"""
        params = {
            "q": query,
            "limit": 10,
            "fields": "title,isbn,author_name,edition_key",
            "lang": "en"
        }
        resp = self.session.get("https://openlibrary.org/search.json", params=params, timeout=30)
        resp.raise_for_status()
        
        docs = resp.json().get("docs", [])
        normalized = []
        for doc in docs:
            isbns = doc.get("isbn", [])
            edition_ids = doc.get("edition_key", [])
            if not isbns and not edition_ids: continue
            normalized.append({
                "isbn": isbns[0] if isbns else None,
                "openlibrary_id": edition_ids[0] if not isbns else None,
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
            
            olid = row.get("ol_id") or row.get("key", "").replace("/books/", "")
            if not isbn and not OL_EDITION_RE.fullmatch(olid or ""): continue
            
            authors = row.get("author_names", [])
            normalized.append({
                "isbn": isbn,
                "openlibrary_id": olid if OL_EDITION_RE.fullmatch(olid or "") else None,
                "title": row.get("title"),
                "author": authors[0] if authors else "Unknown"
            })
        return normalized
    
    def _get_openlibrary(self, identifier):
        base = "https://openlibrary.org"
        path = "books" if OL_EDITION_RE.fullmatch(identifier) else "isbn"
        resp = self.session.get(f"{base}/{path}/{identifier}.json", timeout=30)
        if resp.status_code == 404:
            return None
        resp.raise_for_status()
        edition = resp.json()
        work_id = (edition.get("works") or [{}])[0].get("key")
        work = {}
        if work_id:
            work_resp = self.session.get(f"{base}{work_id}.json", timeout=30)
            if work_resp.status_code == 200:
                work = work_resp.json()
        authors = edition.get("authors") or work.get("authors") or []
        author_name = "Unknown"
        if authors:
            author = authors[0].get("author", authors[0])
            auth_key = author.get("key")
            if auth_key:
                author_resp = self.session.get(f"{base}{auth_key}.json", timeout=30)
                if author_resp.status_code == 200:
                    author_name = author_resp.json().get("name", "Unknown")
        description = edition.get("description") or work.get("description")
        if isinstance(description, dict):
            description = description.get("value")
        isbns = edition.get("isbn_13") or edition.get("isbn_10") or []
        return {
            "isbn": isbns[0] if isbns else (identifier if path == "isbn" else None),
            "openlibrary_id": edition.get("key", "").replace("/books/", "") or None,
            "work_id": work_id,
            "title": edition.get("title"),
            "subtitle": edition.get("subtitle"),
            "author": author_name,
            "description": description,
            "total_pages": edition.get("number_of_pages") or 0
        }

    def _get_booklogr_api(self, url, isbn):
        base_url = url if url.startswith("http") else "https://metadata.booklogr.app"
        
        ed_resp = self.session.get(f"{base_url.rstrip('/')}/v1/edition/{isbn}", timeout=30)
        if ed_resp.status_code != 200:
            return None
        
        ed_data = ed_resp.json()
        isbns = ed_data.get("isbn_13") or ed_data.get("isbn_10") or []
        
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
            "isbn": isbns[0] if isbns else (None if OL_EDITION_RE.fullmatch(isbn) else isbn),
            "openlibrary_id": ed_data.get("ol_id") or ed_data.get("key", "").replace("/books/", "") or (isbn if OL_EDITION_RE.fullmatch(isbn) else None),
            "work_id": "/works/" + work_id if work_ids else None,
            "title": ed_data.get("title"),
            "subtitle": ed_data.get("subtitle"),
            "author": author_name,
            "description": description,
            "total_pages": ed_data.get("number_of_pages") or 0
        }
