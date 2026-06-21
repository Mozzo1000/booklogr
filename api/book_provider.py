import os
import requests
from flask import current_app

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
            "fields": "title,isbn,author_name",
            "lang": "en"
        }
        resp = self.session.get("https://openlibrary.org/search.json", params=params, timeout=8)
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
        
        endpoint = f"{base_url.rstrip('/')}/v1/search/{requests.utils.quote(query)}"
        params = {"limit": 10, "sort": "relevance"}
        
        resp = self.session.get(endpoint, params=params, timeout=8)
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
        resp = self.session.get(f"{base}/isbn/{isbn}.json", timeout=10)
        if resp.status_code != 200:
            return None
        
        ol_data = resp.json()
        
        author_name = "Unknown"
        if ol_data.get("authors"):
            auth_key = ol_data["authors"][0].get("key")
            a_resp = self.session.get(f"{base}{auth_key}.json", timeout=5)
            if a_resp.status_code == 200:
                author_name = a_resp.json().get("name", "Unknown")

        description = ol_data.get("description")
        if not description and ol_data.get("works"):
            work_key = ol_data["works"][0].get("key")
            w_resp = self.session.get(f"{base}{work_key}.json", timeout=5)
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
        
        ed_resp = self.session.get(f"{base_url.rstrip('/')}/v1/edition/{isbn}", timeout=8)
        if ed_resp.status_code != 200:
            return None
        
        ed_data = ed_resp.json()
        
        authors = ed_data.get("author_names", [])
        author_name = authors[0] if (isinstance(authors, list) and len(authors) > 0) else "Unknown"

        description = ""
        work_ids = ed_data.get("work_ids", [])
        if work_ids:
            work_id = work_ids[0].replace("/works/", "")
            w_resp = self.session.get(f"{base_url.rstrip('/')}/v1/work/{work_id}", timeout=5)
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