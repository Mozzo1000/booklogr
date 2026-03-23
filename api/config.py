import os
from datetime import timedelta
from .utils import alert

class Config:
    CSRF_ENABLED = True
    SECRET_KEY = os.environ.get("AUTH_SECRET_KEY")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://admin:password@localhost/booklogr")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=5)
    EXPORT_FOLDER = os.environ.get("EXPORT_FOLDER", "export_data")
    GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
    GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)

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
    if SECRET_KEY == "this-really-needs-to-be-changed":
            alert("USE OF DEPRECATED KEY DETECTED!\nCHANGE THE ENV VAR AUTH_SECRET_KEY TO A RANDOM, UNIQUE STRING")
    elif not SECRET_KEY:
        alert("NO SECRET KEY SET!\nYOU WILL HAVE TO SET THE ENV VAR AUTH_SECRET_KEY TO A RANDOM STRING BEFORE BOOKLOGR WILL START.")