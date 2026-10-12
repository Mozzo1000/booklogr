"""Run with SINGLE_USER_MODE=true DATABASE_URL=sqlite:// python -m unittest discover -s tests."""
import csv
import io
import tempfile
import unittest
from unittest.mock import patch, Mock

from api.app import app
from api.models import db, Books, Profile, Files
from api.extensions import cache
from api.book_provider import BookProvider
from api.routes.tasks import create_csv, create_json
import json
from pathlib import Path

OLID = "OL62524517M"
TITLE = "Science: Abridged Beyond the Point of Usefulness"


class IdentifierTests(unittest.TestCase):
    def setUp(self):
        self.context = app.app_context()
        self.context.push()
        self.assertEqual(app.config['SQLALCHEMY_DATABASE_URI'], 'sqlite://')
        db.create_all()
        db.session.add(Profile(owner_id=1, display_name='test', visibility='public'))
        db.session.commit()
        cache.clear()
        self.client = app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def add_olid(self):
        response = self.client.post('/v1/books', json={
            'title': TITLE, 'author': 'Zach Weinersmith', 'openlibrary_id': 'ol62524517m'})
        self.assertEqual(response.status_code, 200, response.json)
        return response.json['id']

    def test_add_view_status_and_progress_without_isbn(self):
        book_id = self.add_olid()
        book = self.client.get(f'/v1/books/{OLID}').json
        self.assertIsNone(book['isbn'])
        self.assertEqual(book['identifier'], OLID)
        self.assertEqual(book['library_data']['id'], book_id)
        self.assertEqual(self.client.get(f'/v1/books/{OLID}/status').json['id'], book_id)
        self.assertEqual(self.client.patch(f'/v1/books/{book_id}', json={'total_pages': 100}).status_code, 200)
        result = self.client.patch(f'/v1/books/{book_id}', json={'current_page': 20})
        self.assertEqual(result.status_code, 200, result.json)
        self.assertEqual(self.client.get(f'/v1/books/{OLID}').json['library_data']['current_page'], 20)

    def test_multiple_isbnless_books_and_duplicate_edition(self):
        self.add_olid()
        second = self.client.post('/v1/books', json={'title': 'Other', 'openlibrary_id': 'OL123M'})
        self.assertEqual(second.status_code, 200)
        duplicate = self.client.post('/v1/books', json={'title': TITLE, 'openlibrary_id': OLID})
        self.assertEqual(duplicate.status_code, 409)
        self.assertEqual(Books.query.count(), 2)

    def test_missing_invalid_and_work_identifiers(self):
        for payload in ({}, {'openlibrary_id': ''}, {'openlibrary_id': 'OL45960737W'},
                        {'openlibrary_id': 123}, {'isbn': 123}):
            response = self.client.post('/v1/books', json={'title': TITLE, **payload})
            self.assertEqual(response.status_code, 422, payload)
        self.assertEqual(Books.query.count(), 0)

    def test_existing_isbn10_and_isbn13_lookups(self):
        response = self.client.post('/v1/books', json={'title': 'ISBN book', 'isbn': '0140328726'})
        self.assertEqual(response.status_code, 200)
        for identifier in ('0140328726', '9780140328721'):
            self.assertEqual(self.client.get(f'/v1/books/{identifier}').json['library_data']['id'], response.json['id'])

    def test_alias_lookup_and_status(self):
        book_id = self.client.post('/v1/books', json={'title': 'ISBN book', 'isbn': '9780140328721'}).json['id']
        with patch('api.routes.books.BookProvider.get', return_value={'isbn': '9780140328721', 'openlibrary_id': 'OL7353617M'}):
            self.assertEqual(self.client.get('/v1/books/OL7353617M').json['library_data']['id'], book_id)
            self.assertEqual(self.client.get('/v1/books/OL7353617M/status').json['id'], book_id)

    def test_isbn_alias_for_book_saved_only_by_olid(self):
        book_id = self.add_olid()
        with patch('api.routes.books.BookProvider.get', return_value={'isbn': '9780140328721', 'openlibrary_id': OLID}):
            self.assertEqual(self.client.get('/v1/books/9780140328721').json['library_data']['id'], book_id)
            self.assertEqual(self.client.get('/v1/books/9780140328721/status').json['id'], book_id)

    def test_library_search_and_public_profile(self):
        self.add_olid()
        with patch('api.routes.books.BookProvider.search', return_value=[]):
            results = self.client.get(f'/v1/books/search?q={OLID}').json['items']
        self.assertEqual(results[0]['identifier'], OLID)
        self.assertTrue(results[0]['in_library'])
        self.assertEqual(self.client.get('/v1/books').json['items'][0]['openlibrary_id'], OLID)
        self.assertEqual(self.client.get('/v1/profiles/test').json['books'][0]['identifier'], OLID)

    def test_owner_isolation(self):
        db.session.add(Profile(owner_id=2, display_name='other'))
        db.session.add(Books(owner_id=2, title=TITLE, openlibrary_id=OLID))
        db.session.commit()
        with patch('api.routes.books.BookProvider.get', return_value=None):
            self.assertEqual(self.client.get(f'/v1/books/{OLID}').status_code, 404)
            self.assertEqual(self.client.get(f'/v1/books/{OLID}/status').status_code, 404)

    def test_export_import_roundtrip_and_legacy_csv(self):
        self.add_olid()
        with tempfile.TemporaryDirectory() as folder, patch.dict(app.config, EXPORT_FOLDER=folder):
            create_csv(1)
            filename = Files.query.first().filename
            exported = Path(folder, filename).read_bytes()
            row = next(csv.DictReader(io.StringIO(exported.decode())))
            self.assertEqual(row['openlibrary_id'], OLID)
            self.assertEqual(row['isbn'], '')
            create_json(1)
            json_file = next(Path(folder).glob('*.json'))
            self.assertEqual(json.loads(json_file.read_text())[0]['openlibrary_id'], OLID)
        Books.query.delete()
        db.session.commit()
        for expected in ('Imported 1/1', 'Imported 0/1'):
            result = self.client.post('/v1/files', data={'type': 'csv', 'file': (io.BytesIO(exported), 'books.csv')})
            self.assertEqual(result.status_code, 200, result.json)
            self.assertIn(expected, result.json['message'])
        legacy = b'title,isbn,description,reading_status,current_page,total_pages,author,rating\nISBN book,0140328726,,To be read,0,100,Author,\n'
        result = self.client.post('/v1/files', data={'type': 'csv', 'file': (io.BytesIO(legacy), 'legacy.csv')})
        self.assertEqual(result.status_code, 200, result.json)
        self.assertEqual(Books.query.count(), 2)

    def test_provider_uses_edition_and_work_author(self):
        def response(data):
            return Mock(status_code=200, json=Mock(return_value=data))
        with patch('api.book_provider.requests.Session') as session:
            session.return_value.get.side_effect = [
                response({'key': f'/books/{OLID}', 'title': TITLE, 'works': [{'key': '/works/OL45960737W'}]}),
                response({'authors': [{'author': {'key': '/authors/OL1A'}}], 'description': {'value': 'Description'}}),
                response({'name': 'Zach Weinersmith'}),
            ]
            book = BookProvider().get(OLID)
            self.assertEqual(book['author'], 'Zach Weinersmith')
            self.assertEqual(book['description'], 'Description')
            self.assertIsNone(book['isbn'])
            self.assertEqual(session.return_value.get.call_args_list[0].args[0], f'https://openlibrary.org/books/{OLID}.json')

    def test_provider_retains_isbnless_search_results(self):
        with patch('api.book_provider.requests.Session') as session:
            session.return_value.get.return_value.json.return_value = {'docs': [
                {'title': TITLE, 'edition_key': [OLID], 'author_name': ['Zach Weinersmith']}]}
            result = BookProvider().search('Science')
            self.assertEqual(result[0]['openlibrary_id'], OLID)
            self.assertIsNone(result[0]['isbn'])


if __name__ == '__main__':
    unittest.main()
