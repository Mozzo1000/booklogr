from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from api.models import Books, BooksSchema
from api.decorators import required_params

books_endpoint = Blueprint('books', __name__)

@books_endpoint.route("/v1/books", methods=["GET"])
def get_books():
    query_status = request.args.get("status")
    books_schema = BooksSchema(many=True)
    if query_status:
        books = Books.query.filter(Books.reading_status==query_status).all()
    else:
        books = Books.query.all()
    return jsonify(books_schema.dump(books))

@required_params("title", "isbn")
@books_endpoint.route("/v1/books", methods=["POST"])
def add_book():
    """    
    title = db.Column(db.String)
    isbn = db.Column(db.Integer)
    description = db.Column(db.String)
    reading_status = db.Column(db.String)
    current_page = db.Column(db.Integer)
    total_pages = db.Column(db.Integer)
    """
    description = None
    if "description" in request.json:
        description = request.json["description"]

    reading_status = "To be read"
    if "reading_status" in request.json:
        reading_status = request.json["reading_status"]
    current_page = 0
    if "current_page" in request.json:
        current_page = request.json["current_page"]
    total_pages = 0
    if "total_pages" in request.json:
        total_pages = request.json["total_pages"]

    
    new_book = Books(title=request.json["title"], isbn=request.json["isbn"], 
                     description=description, reading_status=reading_status, 
                     current_page=current_page, total_pages=total_pages)
    new_book.save_to_db()
    return jsonify({'message': 'Book added to list.'}), 200