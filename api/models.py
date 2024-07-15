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
    rating = db.Column(db.Numeric(precision=3, scale=2), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("profiles.owner_id"))

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()

class BooksSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Books

class ProfileSchema(ma.SQLAlchemyAutoSchema):
    books = ma.List(ma.Nested(BooksSchema(only=("author", "description", "current_page", "total_pages", "reading_status", "title", "isbn"))))
    num_books_read = ma.Method("get_num_books_read")
    num_books_reading = ma.Method("get_num_books_currently_reading")
    num_books_tbr = ma.Method("get_num_books_to_be_read")

    def get_num_books_read(self, obj):
        query = Books.query.filter(Books.owner_id==obj.owner_id, Books.reading_status=="Read").count()
        if query:
            return query
        else:
            return None
    
    def get_num_books_currently_reading(self, obj):
        query = Books.query.filter(Books.owner_id==obj.owner_id, Books.reading_status=="Currently reading").count()
        if query:
            return query
        else:
            return None
        
    def get_num_books_to_be_read(self, obj):
        query = Books.query.filter(Books.owner_id==obj.owner_id, Books.reading_status=="To be read").count()
        if query:
            return query
        else:
            return None
    
    class Meta:
        model = Profile()
        fields = ("id", "display_name", "visibility", "books", "num_books_read", "num_books_reading", "num_books_tbr",)
