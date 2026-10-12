"""Run with SINGLE_USER_MODE=true DATABASE_URL=sqlite:// python -m unittest discover -s tests."""
import unittest

from sqlalchemy import event

from api.app import app
from api.models import Books, Profile, ReadingSessions, db


class ReadingProgressTests(unittest.TestCase):
    def setUp(self):
        self.context = app.app_context()
        self.context.push()
        self.assertEqual(app.config['SQLALCHEMY_DATABASE_URI'], 'sqlite://')
        db.create_all()
        db.session.add(Profile(owner_id=1, display_name='test'))
        self.book = Books(owner_id=1, title='Original title', isbn='0140328726',
                          current_page=42, total_pages=300, reading_status='To be read')
        db.session.add(self.book)
        db.session.commit()
        self.book_id = self.book.id
        self.client = app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def reload_book(self):
        db.session.expire_all()
        return db.session.get(Books, self.book_id)

    def test_valid_progress(self):
        for value, expected in ((150, 150), ('150', 150), (0, 0), (300, 300)):
            with self.subTest(value=value):
                response = self.client.patch(f'/v1/books/{self.book_id}', json={'current_page': value})
                self.assertEqual(response.status_code, 200, response.json)
                self.assertEqual(response.json, {'message': 'Book changed sucessfully'})
                book = self.reload_book()
                self.assertEqual(book.current_page, expected)
                self.assertIs(type(book.current_page), int)

    def test_invalid_progress_is_never_assigned_or_persisted(self):
        assignments = []

        def record_assignment(target, value, oldvalue, initiator):
            assignments.append(value)

        event.listen(Books.current_page, 'set', record_assignment)
        try:
            for value in (-10, 301, 'abc', None, 12.5, 12.0, True, False,
                          [], {}, '12.5', '', '1e2'):
                with self.subTest(value=value):
                    response = self.client.patch(f'/v1/books/{self.book_id}', json={'current_page': value})
                    self.assertEqual(response.status_code, 400, response.json)
                    self.assertEqual(response.json['error'], 'Bad request')
                    self.assertIsInstance(response.json['message'], str)
                    self.assertEqual(assignments, [])
                    # A later commit must not flush a rejected value.
                    db.session.commit()
                    self.assertEqual(self.reload_book().current_page, 42)
        finally:
            event.remove(Books.current_page, 'set', record_assignment)

    def test_invalid_progress_prevents_other_changes_and_session_creation(self):
        for value in (-10, 301, 'abc', None, 12.5, True):
            with self.subTest(value=value):
                response = self.client.patch(f'/v1/books/{self.book_id}', json={
                    'current_page': value, 'title': 'Changed title',
                    'total_pages': 400, 'status': 'Currently reading'})
                self.assertEqual(response.status_code, 400, response.json)
                db.session.commit()
                book = self.reload_book()
                self.assertEqual(book.current_page, 42)
                self.assertEqual(book.title, 'Original title')
                self.assertEqual(book.total_pages, 300)
                self.assertEqual(book.reading_status, 'To be read')
                self.assertEqual(ReadingSessions.query.count(), 0)

    def test_unknown_total_rejects_progress_until_total_is_set(self):
        self.book.total_pages = None
        db.session.commit()
        for value in (0, 150, '150'):
            with self.subTest(value=value):
                response = self.client.patch(f'/v1/books/{self.book_id}', json={'current_page': value})
                self.assertEqual(response.status_code, 400, response.json)
                self.assertEqual(response.json['error'], 'Bad request')
                self.assertEqual(self.reload_book().current_page, 42)
                self.assertIsNone(self.book.total_pages)
        response = self.client.patch(f'/v1/books/{self.book_id}', json={'total_pages': 300})
        self.assertEqual(response.status_code, 200, response.json)
        response = self.client.patch(f'/v1/books/{self.book_id}', json={'current_page': 150})
        self.assertEqual(response.status_code, 200, response.json)
        self.assertEqual(self.reload_book().current_page, 150)

    def test_progress_uses_existing_total_when_both_fields_are_submitted(self):
        response = self.client.patch(f'/v1/books/{self.book_id}', json={
            'total_pages': 400, 'current_page': 350})
        self.assertEqual(response.status_code, 400, response.json)
        book = self.reload_book()
        self.assertEqual(book.current_page, 42)
        self.assertEqual(book.total_pages, 300)

    def test_edit_without_progress(self):
        self.book.total_pages = None
        db.session.commit()
        response = self.client.patch(f'/v1/books/{self.book_id}', json={
            'title': 'Changed title', 'author': 'Author', 'rating': 4.5})
        self.assertEqual(response.status_code, 200, response.json)
        self.assertEqual(response.json, {'message': 'Book changed sucessfully'})
        book = self.reload_book()
        self.assertEqual(book.title, 'Changed title')
        self.assertEqual(book.author, 'Author')
        self.assertEqual(float(book.rating), 4.5)
        self.assertEqual(book.current_page, 42)
        self.assertIsNone(book.total_pages)


if __name__ == '__main__':
    unittest.main()
