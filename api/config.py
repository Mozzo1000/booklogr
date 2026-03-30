import os
from datetime import timedelta
from .utils import alert
import secrets
import platform
from pathlib import Path

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
    

class DesktopConfig:
    home = Path.home()
    if platform.system() == "Windows":
        data_dir = home / "AppData/Local/BookLogr"
    elif platform.system() == "Darwin":
        data_dir = home / "Library/Application Support/BookLogr"
    else:
        data_dir = home / ".local/share/booklogr"
    
    os.makedirs(data_dir, exist_ok=True)

    CSRF_ENABLED = True
    SECRET_KEY = secrets.token_hex(32)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{data_dir / 'books.db'}"
    EXPORT_FOLDER = os.path.join(home, "export_data")
    GOOGLE_CLIENT_ID = None
    GOOGLE_CLIENT_SECRET = None
    SINGLE_USER_MODE = "True"

def check_config(app_config):
     if not str(app_config.get("SINGLE_USER_MODE")).lower() in ["true", "y"]:
        if app_config.get("SECRET_KEY") == "this-really-needs-to-be-changed":
                alert("USE OF DEPRECATED KEY DETECTED!\nCHANGE THE ENV VAR AUTH_SECRET_KEY TO A RANDOM, UNIQUE STRING")
        elif not app_config.get("SECRET_KEY"):
            alert("NO SECRET KEY SET!\nYOU WILL HAVE TO SET THE ENV VAR AUTH_SECRET_KEY TO A RANDOM STRING BEFORE BOOKLOGR WILL START.")