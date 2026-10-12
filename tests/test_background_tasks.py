"""Run with python -m unittest discover -s tests (or pytest)."""
import os
import tempfile
import threading
import unittest
from pathlib import Path
from unittest.mock import patch

from flask import Flask, has_app_context
from sqlalchemy.exc import IntegrityError

from api.models import db, ma, Tasks, Files, UserSettings
from api.routes import tasks


class BackgroundTaskTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.app = Flask(__name__)
        self.app.config.update(
            TESTING=True, SINGLE_USER_MODE='true',
            SQLALCHEMY_DATABASE_URI=os.environ.get(
                'BOOKLOGR_TEST_DATABASE_URL', f'sqlite:///{self.directory.name}/tasks.db'),
            EXPORT_FOLDER=self.directory.name,
        )
        db.init_app(self.app)
        ma.init_app(self.app)
        self.app.register_blueprint(tasks.tasks_endpoint)
        with self.app.app_context():
            db.create_all()
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()
        self.directory.cleanup()

    def task(self, type='csv_export', status='fresh', owner=1, error=None):
        with self.app.app_context():
            task = Tasks(type=type, data='{}', created_by=owner, status=status, error_message=error)
            task.save_to_db()
            return task.id

    def status(self, task_id):
        response = self.client.get(f'/v1/tasks/{task_id}')
        self.assertEqual(response.status_code, 200)
        return response.json

    def run_worker(self, task_id):
        failures = []
        cleanups = []
        sessions = []
        context = self.app.app_context()

        def work():
            try:
                tasks._start_background_task(context, task_id, 1)
            except Exception as error:
                failures.append(error)
            cleanups.append(has_app_context())
            sessions.append(id(context) in db.session.registry.registry)

        thread = threading.Thread(target=work)
        thread.start()
        thread.join(timeout=10)
        self.assertFalse(thread.is_alive())
        self.assertEqual(failures, [])
        self.assertEqual(cleanups, [False])
        self.assertFalse(sessions[-1])

    def test_successful_exports_and_context_cleanup(self):
        for type, extension in (('csv_export', 'csv'), ('json_export', 'json'), ('html_export', 'html')):
            with self.subTest(type=type):
                task_id = self.task(type, error='old error')
                original = getattr(tasks, f'create_{extension}')

                def execute(claim):
                    started = db.session.get(Tasks, task_id)
                    self.assertEqual(started.status, 'started')
                    self.assertIsNotNone(started.updated_on)
                    self.assertIsNone(started.error_message)
                    original(claim)

                with patch.object(tasks, f'create_{extension}', side_effect=execute) as handler:
                    self.run_worker(task_id)
                handler.assert_called_once_with(1)
                result = self.status(task_id)
                self.assertEqual(result['status'], 'success')
                self.assertIsNotNone(result['updated_on'])
                self.assertIsNone(result['error_message'])
                self.assertEqual(len(list(Path(self.directory.name).glob(f'*.{extension}'))), 1)

    def test_failure_persisted_logged_and_context_cleaned(self):
        task_id = self.task()
        with patch.object(tasks, 'create_csv', side_effect=RuntimeError('password=secret')):
            with self.assertLogs(self.app.logger, level='ERROR') as logs:
                self.run_worker(task_id)
        result = self.status(task_id)
        self.assertEqual(result['status'], 'failed')
        self.assertIsNotNone(result['updated_on'])
        self.assertIsNotNone(result['error_message'])
        self.assertNotIn('secret', result['error_message'])
        self.assertEqual(logs.records[0].task_id, task_id)
        self.assertIsInstance(logs.records[0].exc_info[1], RuntimeError)
        self.assertIn('Traceback', logs.output[0])

    def test_failed_flush_requires_rollback(self):
        task_id = self.task()

        def broken_database(claim):
            db.session.add(Files(id=1, filename='duplicate'))
            db.session.add(Files(id=1, filename='duplicate'))
            try:
                db.session.flush()
            except IntegrityError:
                self.assertFalse(db.session().is_active)
                raise

        with patch.object(tasks, 'create_csv', side_effect=broken_database):
            with self.assertLogs(self.app.logger, level='ERROR'):
                self.run_worker(task_id)
        result = self.status(task_id)
        self.assertEqual(result['status'], 'failed')
        self.assertEqual(result['error_message'], 'Database operation failed.')

    def test_successful_retry_executes_once_and_clears_error(self):
        task_id = self.task()
        with patch.object(tasks, 'create_csv', side_effect=RuntimeError('first')) as handler:
            with self.assertLogs(self.app.logger, level='ERROR'):
                self.run_worker(task_id)
        first_timestamp = self.status(task_id)['updated_on']
        with patch.object(tasks, 'create_csv') as handler:
            response = self.client.post(f'/v1/tasks/{task_id}/retry')
        handler.assert_called_once_with(1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {'message': 'Task set to be retried.'})
        result = self.status(task_id)
        self.assertEqual(result['status'], 'success')
        self.assertIsNone(result['error_message'])
        self.assertNotEqual(result['updated_on'], first_timestamp)
        self.assertFalse(has_app_context())

    def test_failed_retry_updates_diagnostics(self):
        task_id = self.task(status='failed', error='Previous failure')
        with patch.object(tasks, 'create_csv', side_effect=RuntimeError('retry')) as handler:
            with self.assertLogs(self.app.logger, level='ERROR'):
                response = self.client.post(f'/v1/tasks/{task_id}/retry')
        handler.assert_called_once_with(1)
        self.assertEqual(response.status_code, 200)
        result = self.status(task_id)
        self.assertEqual(result['status'], 'failed')
        self.assertNotEqual(result['error_message'], 'Previous failure')
        self.assertIsNotNone(result['updated_on'])
        self.assertFalse(has_app_context())

    def test_unknown_task_type_fails(self):
        task_id = self.task('unsupported')
        with self.assertLogs(self.app.logger, level='ERROR'):
            self.run_worker(task_id)
        self.assertEqual(self.status(task_id)['status'], 'failed')
        self.assertEqual(self.client.post('/v1/tasks', json={'type': 'unsupported', 'data': {}}).status_code, 422)

    def test_running_or_queued_task_cannot_retry_or_run_twice(self):
        for status in ('fresh', 'started'):
            task_id = self.task(status=status)
            with patch.object(tasks, 'create_csv') as handler:
                self.assertEqual(self.client.post(f'/v1/tasks/{task_id}/retry').status_code, 409)
                self.run_worker(task_id)
                self.run_worker(task_id)
            self.assertEqual(handler.call_count, 1 if status == 'fresh' else 0)

    def test_concurrent_retry_rejected_while_execution_running(self):
        task_id = self.task(status='failed')
        entered = threading.Event()
        release = threading.Event()
        responses = []

        def execute(claim):
            entered.set()
            self.assertTrue(release.wait(10))

        def retry():
            with self.app.test_client() as client:
                responses.append(client.post(f'/v1/tasks/{task_id}/retry').status_code)

        with patch.object(tasks, 'create_csv', side_effect=execute) as handler:
            thread = threading.Thread(target=retry)
            thread.start()
            try:
                self.assertTrue(entered.wait(10))
                self.assertEqual(self.client.post(f'/v1/tasks/{task_id}/retry').status_code, 409)
            finally:
                release.set()
                thread.join(10)
        self.assertFalse(thread.is_alive())
        self.assertEqual(responses, [200])
        handler.assert_called_once_with(1)

    def test_creation_and_status_contract_actual_thread(self):
        original_thread = threading.Thread
        threads = []

        def capture(*args, **kwargs):
            thread = original_thread(*args, **kwargs)
            threads.append(thread)
            return thread

        with patch.object(tasks.threading, 'Thread', side_effect=capture):
            response = self.client.post('/v1/tasks', json={'type': 'csv_export', 'data': {}})
            self.assertEqual(response.status_code, 202)
            self.assertEqual(response.json['message'], 'Task created.')
            for thread in threads:
                thread.join(10)
                self.assertFalse(thread.is_alive())
        self.assertEqual(len(threads), 1)
        result = self.status(response.json['task_id'])
        self.assertEqual(result['status'], 'success')
        self.assertTrue({'id', 'type', 'data', 'status', 'worker', 'created_on', 'updated_on', 'created_by'} <= result.keys())
        with self.app.app_context():
            self.assertEqual(Files.query.count(), 1)

    def test_owner_isolation_and_legacy_success(self):
        task_id = self.task(status='success')
        self.assertIsNone(self.status(task_id)['error_message'])
        other_id = self.task(owner=2)
        self.assertEqual(self.client.get(f'/v1/tasks/{other_id}').status_code, 404)
        self.assertEqual(self.client.post(f'/v1/tasks/{other_id}/retry').status_code, 404)
        self.assertEqual(self.client.post('/v1/tasks/99999/retry').status_code, 404)

    def test_mastodon_success_and_failure(self):
        with self.app.app_context():
            UserSettings(owner_id=1, mastodon_url='https://example.test',
                         mastodon_access_token='test-token').save_to_db()
        for fails in (False, True):
            task_id = self.task('share_book_event')
            with self.app.app_context():
                task = db.session.get(Tasks, task_id)
                task.data = '{"title": "Book", "author": "Author", "reading_status": "Read"}'
                task.save_to_db()
            with patch.object(tasks, 'Mastodon') as mastodon:
                if fails:
                    mastodon.return_value.status_post.side_effect = RuntimeError('network')
                    with self.assertLogs(self.app.logger, level='ERROR'):
                        self.run_worker(task_id)
                else:
                    self.run_worker(task_id)
                mastodon.return_value.status_post.assert_called_once()
            self.assertEqual(self.status(task_id)['status'], 'failed' if fails else 'success')

    def test_final_commit_failure_is_not_success(self):
        from sqlalchemy.exc import SQLAlchemyError
        task_id = self.task()
        original_commit = db.session.commit
        commits = []

        def commit():
            commits.append(True)
            if len(commits) == 2:
                raise SQLAlchemyError('final status commit failed')
            return original_commit()

        with patch.object(tasks, 'create_csv'):
            with patch.object(db.session, 'commit', side_effect=commit):
                with self.assertLogs(self.app.logger, level='ERROR'):
                    self.run_worker(task_id)
        self.assertEqual(self.status(task_id)['status'], 'failed')
        self.assertEqual(len(commits), 3)

    def test_authentication_remains_required(self):
        from flask_jwt_extended import JWTManager
        self.app.config.update(SINGLE_USER_MODE='false', SECRET_KEY='test-secret')
        JWTManager(self.app)
        task_id = self.task()
        self.assertEqual(self.client.get(f'/v1/tasks/{task_id}').status_code, 401)
        self.assertEqual(self.client.post(f'/v1/tasks/{task_id}/retry').status_code, 401)
        self.assertEqual(self.client.post('/v1/tasks', json={'type': 'csv_export', 'data': {}}).status_code, 401)

    def test_logging_failure_cannot_prevent_failure_persistence(self):
        task_id = self.task()
        with self.app.app_context():
            with patch.object(tasks, 'create_csv', side_effect=RuntimeError('execution')):
                with patch.object(self.app.logger, 'error', side_effect=RuntimeError('logging')):
                    with self.assertRaisesRegex(RuntimeError, 'logging'):
                        tasks._start_background_task(self.app.app_context(), task_id, 1)
        self.assertEqual(self.status(task_id)['status'], 'failed')
        self.assertFalse(has_app_context())




class TaskMigrationTests(unittest.TestCase):
    def test_upgrade_and_downgrade_preserve_existing_tasks(self):
        from flask_migrate import Migrate, upgrade, downgrade
        from sqlalchemy import inspect, text, MetaData

        with tempfile.TemporaryDirectory() as directory:
            app = Flask(__name__)
            app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
                'BOOKLOGR_TEST_DATABASE_URL', f'sqlite:///{directory}/migration.db')
            db.init_app(app)
            migration_directory = str(Path(__file__).resolve().parents[1] / 'migrations')
            Migrate(app, db, directory=migration_directory)
            with app.app_context():
                # Reset migration bookkeeping too when reusing a disposable database.
                existing = MetaData()
                existing.reflect(bind=db.engine)
                existing.drop_all(bind=db.engine)
                upgrade(revision='0246901434a1')
                for status in ('fresh', 'started', 'success'):
                    db.session.execute(text('INSERT INTO tasks (status, created_on) VALUES (:status, CURRENT_TIMESTAMP)'), {'status': status})
                db.session.commit()
                upgrade()
                rows = db.session.execute(text('SELECT status, error_message FROM tasks ORDER BY id')).all()
                self.assertEqual(rows, [('fresh', None), ('started', None), ('success', None)])
                db.session.remove()
                downgrade(revision='0246901434a1')
                self.assertNotIn('error_message', {column['name'] for column in inspect(db.engine).get_columns('tasks')})
                self.assertEqual(db.session.execute(text('SELECT COUNT(*) FROM tasks')).scalar(), 3)
                db.session.remove()
                upgrade()
                self.assertIn('error_message', {column['name'] for column in inspect(db.engine).get_columns('tasks')})
                db.session.remove()
                migrated = MetaData()
                migrated.reflect(bind=db.engine)
                migrated.drop_all(bind=db.engine)
                db.engine.dispose()


if __name__ == '__main__':
    unittest.main()
