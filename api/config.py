import os
from datetime import timedelta

class Config:
    CSRF_ENABLED = True
    SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "this-really-needs-to-be-changed")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://admin:password@localhost/booklogr")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=5)

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