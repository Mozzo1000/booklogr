import unittest

from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from api.models import db, UserSettings
from api.routes.settings import settings_endpoint


class SettingsTests(unittest.TestCase):
    def setUp(self):
        app = Flask(__name__)
        app.config.update(
            TESTING=True,
            SQLALCHEMY_DATABASE_URI='sqlite://',
            SINGLE_USER_MODE='false',
            JWT_SECRET_KEY='settings-regression-test-secret-key',
        )
        db.init_app(app)
        JWTManager(app)
        app.register_blueprint(settings_endpoint)
        self.context = app.app_context()
        self.context.push()
        db.create_all()
        db.session.add(UserSettings(owner_id=1))
        db.session.commit()
        self.client = app.test_client()
        self.token = create_access_token(identity='1', additional_claims={'id': 1})

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.context.pop()

    def test_patch_empty_json_returns_bad_request(self):
        response = self.client.patch(
            '/v1/settings',
            json={},
            headers={'Authorization': f'Bearer {self.token}'},
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.get_json(), {
            'error': 'Bad request',
            'message': 'send_book_events, mastodon_url and/or mastodon_access_token not given.',
        })


if __name__ == '__main__':
    unittest.main()
