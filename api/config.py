import os

class Config:
    CSRF_ENABLED = True
    SECRET_KEY = os.environ.get("AUTH_SECRET_KEY", "this-really-needs-to-be-changed")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "postgresql://admin:password@localhost/minimal-reading")