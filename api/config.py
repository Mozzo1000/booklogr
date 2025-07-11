import os
from datetime import timedelta

class Config:
    CSRF_ENABLED = True
    SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "this-really-needs-to-be-changed")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://admin:password@localhost/booklogr")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=5)
    EXPORT_FOLDER = os.environ.get("EXPORT_FOLDER", "export_data")
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)

    MAIL_SERVER = os.environ.get("MAIL_SERVER", None)
    MAIL_PORT = os.environ.get("MAIL_PORT", 587)
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", True)
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", None)
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", None)
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_SENDER", os.environ.get("MAIL_USERNAME"))

    ALLOWED_EXTENSIONS = {"csv"}

    SWAGGER = {
        "openapi": "3.0.0",
        "info": {
            "title": "BookLogr API",
            "description": "API for accessing BookLogr",
            "contact": {
                "url": "https://github.com/mozzo1000/booklogr",
            },
            "version": "1.0.0"
        },
        "components": {
            "securitySchemes": {
                "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"    # optional, arbitrary value for documentation purposes
                }
            }

        },
        "specs_route": "/docs"
    }