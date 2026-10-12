"""Run with DATABASE_URL=sqlite:// SINGLE_USER_MODE=true python -m pytest tests.

Tests enable JWT authentication explicitly, regardless of single-user mode.
"""
import unittest
from unittest.mock import patch

from flask_jwt_extended import create_access_token

from api.app import app
from api.models import Books, Notes, Profile, db


class EditRecordTests(unittest.TestCase):
    def setUp(self):
        self.assertEqual(app.config['SQLALCHEMY_DATABASE_URI'], 'sqlite://')
        self.config = patch.dict(app.config, TESTING=True, SINGLE_USER_MODE='false',
                                 JWT_SECRET_KEY='edit-record-tests-secret-key-32-chars')
        self.config.start()
        self.context = app.app_context()
        self.context.push()
        db.create_all()
        db.session.add_all([
            Profile(owner_id=1, display_name='owner'),
            Profile(owner_id=2, display_name='other'),
        ])
        db.session.commit()
        token = create_access_token(identity='1', additional_claims={'id': 1})
        self.headers = {'Authorization': f'Bearer {token}'}
        self.client = app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()
        self.config.stop()

    def add_book(self, owner_id):
        book = Books(owner_id=owner_id, title='Original title', total_pages=100,
                     current_page=0, reading_status='To be read')
        book.save_to_db()
        return book

    def add_note(self, owner_id):
        note = Notes(book_id=self.add_book(owner_id).id, content='Original note',
                     visibility='hidden', quote_page=1)
        note.save_to_db()
        return note

    def assert_not_found(self, response, resource, record_id):
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json, {
            'error': 'Not found',
            'message': f'No {resource} with ID: {record_id} was found',
        })

    def test_missing_note(self):
        response = self.client.patch('/v1/notes/999', headers=self.headers,
                                     json={'content': 'Changed note'})
        self.assert_not_found(response, 'note', 999)

    def test_missing_book(self):
        response = self.client.patch('/v1/books/999', headers=self.headers,
                                     json={'current_page': 20, 'title': 'Changed title'})
        self.assert_not_found(response, 'book', 999)

    def test_other_users_note(self):
        note = self.add_note(2)
        response = self.client.patch(f'/v1/notes/{note.id}', headers=self.headers,
                                     json={'content': 'Changed note', 'visibility': 'public',
                                           'quote_page': 20})
        self.assert_not_found(response, 'note', note.id)
        db.session.expire_all()
        self.assertEqual((note.content, note.visibility, note.quote_page),
                         ('Original note', 'hidden', 1))

    def test_other_users_book(self):
        book = self.add_book(2)
        response = self.client.patch(f'/v1/books/{book.id}', headers=self.headers,
                                     json={'current_page': 20, 'title': 'Changed title'})
        self.assert_not_found(response, 'book', book.id)
        db.session.expire_all()
        self.assertEqual((book.title, book.current_page), ('Original title', 0))

    def test_owned_note(self):
        note = self.add_note(1)
        response = self.client.patch(f'/v1/notes/{note.id}', headers=self.headers,
                                     json={'content': 'Changed note', 'visibility': 'public',
                                           'quote_page': 20})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Note changed sucessfully'})
        db.session.expire_all()
        self.assertEqual((note.content, note.visibility, note.quote_page),
                         ('Changed note', 'public', 20))

    def test_owned_book(self):
        book = self.add_book(1)
        response = self.client.patch(f'/v1/books/{book.id}', headers=self.headers,
                                     json={'current_page': 20, 'title': 'Changed title'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Book changed sucessfully'})
        db.session.expire_all()
        self.assertEqual((book.title, book.current_page), ('Changed title', 20))
