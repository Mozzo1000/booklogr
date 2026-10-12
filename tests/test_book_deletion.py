"""Run: SINGLE_USER_MODE=true DATABASE_URL=sqlite:// python -m unittest discover -s tests.

For PostgreSQL, set BOOK_DELETION_TEST_DATABASE_URL to an empty disposable database.
The suite creates and drops all application tables in that database.
"""
import os
import unittest

from flask import Flask
from sqlalchemy import event, text

from api.models import db, Books, Notes, ReadingSessions, FieldValue, Fields, Profile
from api.routes.books import books_endpoint


class BookDeletionTests(unittest.TestCase):
    foreign_keys = True

    def setUp(self):
        self.app = Flask(__name__)
        self.app.config.update(
            TESTING=True,
            SINGLE_USER_MODE='true',
            SQLALCHEMY_DATABASE_URI=os.environ.get('BOOK_DELETION_TEST_DATABASE_URL', 'sqlite://'),
        )
        db.init_app(self.app)
        self.app.register_blueprint(books_endpoint)
        self.context = self.app.app_context()
        self.context.push()
        if db.engine.dialect.name == 'sqlite':
            enabled = self.foreign_keys

            @event.listens_for(db.engine, 'connect')
            def configure_foreign_keys(connection, record):
                connection.execute(f'PRAGMA foreign_keys={int(enabled)}')

            self.assertEqual(db.session.execute(text('PRAGMA foreign_keys')).scalar(), int(enabled))
        db.create_all()
        db.session.add(Profile(owner_id=1, display_name='test'))
        db.session.commit()
        self.client = self.app.test_client()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        db.engine.dispose()
        self.context.pop()

    def create_book(self, title='Book', dependents=True):
        book = Books(owner_id=1, title=title, isbn=title)
        db.session.add(book)
        db.session.flush()
        book_id = book.id
        if dependents:
            fields = Fields.query.all()
            if not fields:
                fields = [Fields(owner_id=1, name=f'Field {i}', field_type='text') for i in range(2)]
                db.session.add_all(fields)
                db.session.flush()
            for i, field in enumerate(fields):
                db.session.add_all([
                    Notes(book_id=book_id, content=f'{title} note {i}'),
                    ReadingSessions(book_id=book_id, status='Read'),
                    FieldValue(book_id=book_id, field_id=field.id, value=f'{title} value {i}'),
                ])
        db.session.commit()
        # Exercise deletion with unloaded relationships, as in a fresh API request.
        db.session.remove()
        return book_id

    def delete_book(self, book_id):
        response = self.client.delete(f'/v1/books/{book_id}')
        self.assertEqual(response.status_code, 200, response.json)
        self.assertEqual(response.json, {'message': 'Book removed successfully'})
        db.session.remove()

    def test_deletes_all_book_dependents(self):
        book_id = self.create_book()
        for model in (Notes, ReadingSessions, FieldValue):
            self.assertEqual(model.query.filter_by(book_id=book_id).count(), 2)
        self.delete_book(book_id)
        self.assertIsNone(db.session.get(Books, book_id))
        for model in (Notes, ReadingSessions, FieldValue):
            self.assertEqual(model.query.count(), 0)
        self.assertEqual(Fields.query.count(), 2)

    def dependent_rows(self, model, book_id):
        return [tuple(getattr(row, column.name) for column in model.__table__.columns)
                for row in model.query.filter_by(book_id=book_id).order_by(model.id)]

    def test_other_book_and_historical_orphan_are_preserved(self):
        first = self.create_book('First')
        second = self.create_book('Second')
        orphan = Notes(content='Historical orphan', book_id=None)
        db.session.add(orphan)
        db.session.commit()
        orphan_id = orphan.id
        expected = {model: self.dependent_rows(model, second)
                    for model in (Notes, ReadingSessions, FieldValue)}
        db.session.remove()
        self.delete_book(first)
        self.assertIsNone(db.session.get(Books, first))
        self.assertEqual(db.session.get(Books, second).title, 'Second')
        for model, rows in expected.items():
            self.assertEqual(model.query.filter_by(book_id=first).count(), 0)
            self.assertEqual(self.dependent_rows(model, second), rows)
        self.assertEqual(db.session.get(Notes, orphan_id).content, 'Historical orphan')
        self.assertIsNone(db.session.get(Notes, orphan_id).book_id)
        self.assertEqual(Fields.query.count(), 2)

    def test_delete_book_without_dependents(self):
        book_id = self.create_book(dependents=False)
        self.delete_book(book_id)
        self.assertIsNone(db.session.get(Books, book_id))

    def test_nonexistent_book_returns_existing_response(self):
        response = self.client.delete('/v1/books/999')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json, {
            'error': 'Not found', 'message': 'No book with ID: 999 was found',
        })


class BookDeletionWithoutForeignKeysTests(BookDeletionTests):
    foreign_keys = False

    def setUp(self):
        if os.environ.get('BOOK_DELETION_TEST_DATABASE_URL'):
            self.skipTest('SQLite-specific foreign key enforcement variant')
        super().setUp()


if __name__ == '__main__':
    unittest.main()
