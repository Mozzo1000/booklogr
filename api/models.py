from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow, fields
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()
ma = Marshmallow()

class Books(db.Model):
    __tablename__ = "books"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String)
    isbn = db.Column(db.String)
    description = db.Column(db.String)
    reading_status = db.Column(db.String)
    current_page = db.Column(db.Integer)
    total_pages = db.Column(db.Integer)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

class BooksSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Books
