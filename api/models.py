from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from marshmallow import post_dump
from datetime import datetime, timezone

db = SQLAlchemy()
ma = Marshmallow()

class Files(db.Model):
    __tablename__ = "files"
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String)
    owner_id = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

class FilesSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Files
        fields = ("id", "filename", "created_at",)

class Tasks(db.Model):
    __tablename__ = "tasks"
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String)
    data = db.Column(db.String)
    status = db.Column(db.String, default="fresh")
    worker = db.Column(db.String, nullable=True)
    created_on = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_on = db.Column(db.DateTime, nullable=True)
    created_by = db.Column(db.Integer)

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

class TasksSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Tasks


class Notes(db.Model):
    __tablename__ = "notes"
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.Integer, db.ForeignKey("books.id"))
    content = db.Column(db.String, nullable=False)
    quote_page = db.Column(db.Integer, nullable=True)
    visibility = db.Column(db.String, default="hidden")
    created_on = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

class NotesSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Notes

class NotesPublicOnlySchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Notes
    
    SKIP_VALUES = set([None])

    @post_dump
    def remove_hidden_notes(self, data, **kwargs):
        if data["visibility"] == "hidden":
            return
        else:
            return {
                key: value for key, value in data.items()
                if value not in self.SKIP_VALUES
        }


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
    created_on = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    notes = db.relationship("Notes", backref="books")

    def save_to_db(self):
        db.session.add(self)
        db.session.commit()
    
    def delete(self):
        db.session.delete(self)
        db.session.commit()

class BooksStatusSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Books
        fields = ("id", "reading_status", "current_page",)

class BooksSchema(ma.SQLAlchemyAutoSchema):
    num_notes = ma.Method("get_num_notes")
    class Meta:
        model = Books

    def get_num_notes(self, obj):
        query = Notes.query.filter(Notes.book_id==obj.id).count()
        if query:
            return query
        else:
            return 0

class BooksPublicOnlySchema(ma.SQLAlchemyAutoSchema):
    notes = ma.Nested(NotesPublicOnlySchema(many=True))
    num_notes = ma.Method("get_num_notes")
    class Meta:
        model = Books

    def get_num_notes(self, obj):
        query = Notes.query.filter(Notes.book_id==obj.id, Notes.visibility=="public").count()
        if query:
            return query
        else:
            return 0

class ProfileSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Profile()
        load_instance = True
        fields = ("id", "display_name", "visibility", "books", "num_books_read", "num_books_reading", "num_books_tbr",)

    id = ma.Integer()
    display_name = ma.String()
    visibility = ma.String()
    
    books = db.relationship("Books", backref='profiles')
    books = ma.List(ma.Nested(BooksPublicOnlySchema(only=("id", "author", "description", "current_page", "total_pages", "reading_status", "title", "isbn", "rating", "notes", "num_notes"))))
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
 
class UserSettings(db.Model):
    __tablename__ = "user_settings"
    id = db.Column(db.Integer, primary_key=True)
    owner_id = db.Column(db.Integer, unique=True)
    send_book_events = db.Column(db.Boolean, default=False)
    mastodon_url = db.Column(db.String, nullable=True)
    mastodon_access_token = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_on = db.Column(db.DateTime, nullable=True)

    def save_to_db(self):
            db.session.add(self)
            db.session.commit()
    
class UserSettingsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = UserSettings