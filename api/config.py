import os
from datetime import timedelta
from .utils import alert

class Config:
    CSRF_ENABLED = True
    SECRET_KEY = os.environ.get("AUTH_SECRET_KEY")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///books.db")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=5)
    EXPORT_FOLDER = os.environ.get("EXPORT_FOLDER", "export_data")
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
    SINGLE_USER_MODE = os.environ.get("SINGLE_USER_MODE", "False")
    AUTH_REQUIRE_VERIFICATION = os.environ.get("AUTH_REQUIRE_VERIFICATION", "False")
    
    MAIL_SERVER = os.environ.get("MAIL_SERVER", None)
    MAIL_PORT = os.environ.get("MAIL_PORT", 587)
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", True)
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", None)
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", None)
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_SENDER", os.environ.get("MAIL_USERNAME"))

    CACHE_TYPE = "SimpleCache"
    CACHE_DEFAULT_TIMEOUT = 300
    
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
    if not str(SINGLE_USER_MODE).lower() in ["true", "y"]:
        if SECRET_KEY == "this-really-needs-to-be-changed":
                alert("USE OF DEPRECATED KEY DETECTED!\nCHANGE THE ENV VAR AUTH_SECRET_KEY TO A RANDOM, UNIQUE STRING")
        elif not SECRET_KEY:
            alert("NO SECRET KEY SET!\nYOU WILL HAVE TO SET THE ENV VAR AUTH_SECRET_KEY TO A RANDOM STRING BEFORE BOOKLOGR WILL START.")

    @staticmethod
    def can_send_email():
        print(Config.MAIL_SERVER)
        if Config.MAIL_SERVER is not None and Config.MAIL_PASSWORD is not None and Config.MAIL_USERNAME is not None and Config.MAIL_DEFAULT_SENDER is not None:
            return True
        else:
            return False