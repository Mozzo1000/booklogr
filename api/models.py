from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow, fields
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()
ma = Marshmallow()


class Profile(db.Model):
    __tablename__ = "profiles"
    id = db.Column(db.Integer, primary_key=True)
    display_name = db.Column(db.String, unique=True)
    visibility = db.Column(db.String, default="hidden")
    owner_id = db.Column(db.Integer, unique=True)
    books = db.relationship("Books", backref='profiles')

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

class Books(db.Model):
    __tablename__ = "books"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    isbn = db.Column(db.String)
    description = db.Column(db.String)
    author = db.Column(db.String)
    reading_status = db.Column(db.String)
    current_page = db.Column(db.Integer)
    total_pages = db.Column(db.Integer)
    owner_id = db.Column(db.Integer, db.ForeignKey("profiles.owner_id"))

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

class BooksSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Books

class ProfileSchema(ma.SQLAlchemyAutoSchema):
    books = ma.List(ma.Nested(BooksSchema(only=("author", "description", "current_page", "total_pages", "reading_status", "title", "isbn"))))
    class Meta:
        model = Profile()
        fields = ("id", "display_name", "visibility", "books",)
