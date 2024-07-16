from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from api.models import Books, BooksSchema, NotesSchema, Notes
from api.decorators import required_params

books_endpoint = Blueprint('books', __name__)

@books_endpoint.route("/v1/books", methods=["GET"])
@jwt_required()
def get_books():
    claim_id = get_jwt()["id"]
    query_status = request.args.get("status")
    books_schema = BooksSchema(many=True)
    if query_status:
        books = Books.query.filter(Books.owner_id==claim_id, Books.reading_status==query_status).all()
    else:
        books = Books.query.filter(Books.owner_id==claim_id).all()
    return jsonify(books_schema.dump(books))

@required_params("title", "isbn")
@books_endpoint.route("/v1/books", methods=["POST"])
@jwt_required()
def add_book():
    """    
    title = db.Column(db.String)
    isbn = db.Column(db.Integer)
    description = db.Column(db.String)
    reading_status = db.Column(db.String)
    current_page = db.Column(db.Integer)
    total_pages = db.Column(db.Integer)
    """

    claim_id = get_jwt()["id"]

    author = None
    if "author" in request.json:
        author = request.json["author"]

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

    
    new_book = Books(owner_id=claim_id, title=request.json["title"], isbn=request.json["isbn"], 
                     description=description, reading_status=reading_status, 
                     current_page=current_page, total_pages=total_pages, author=author)
    new_book.save_to_db()
    return jsonify({'message': 'Book added to list.'}), 200

@books_endpoint.route("/v1/books/<id>", methods=["PATCH"])
@jwt_required()
def edit_book(id):
    claim_id = get_jwt()["id"]
    book = Books.query.filter(Books.owner_id==claim_id, Books.id==id).first()
    if request.json:
        if "current_page" in request.json:
            book.current_page = request.json["current_page"]
        if "status" in request.json:
            # We should ideally do some validation here to ensure that the status being recieved matches
            # what we can to save in the column, ie "Currently reading", "To be read" or "Read", case sensitive.
            book.reading_status = request.json["status"]
        if "rating" in request.json:
            book.rating = request.json["rating"]
    else:
        return jsonify({
                    "error": "Bad request",
                    "message": "Received no json"
        }), 400
    try:
        book.save_to_db()
        return jsonify({'message': 'Book changed sucessfully'}), 200
    except:
        return jsonify({
                "error": "Unkown error",
                "message": "Unkown error occurred"
    }), 500

@books_endpoint.route("/v1/books/<id>", methods=["DELETE"])
@jwt_required()
def remove_book(id):
    claim_id = get_jwt()["id"]
    book = Books.query.filter(Books.owner_id==claim_id, Books.id==id).first()
    if book:
        book.delete()
        return jsonify({'message': 'Book removed successfully'}), 200
    else:
        return jsonify({
                    "error": "Not found",
                    "message": f"No book with ID: {id} was found"
        }), 404
    
@books_endpoint.route("/v1/books/<id>/notes", methods=["GET"])
@jwt_required()
def get_notes_for_book(id):
    claim_id = get_jwt()["id"]
    notes_schema = NotesSchema(many=True)
    book = Books.query.filter(Books.owner_id==claim_id, Books.id==id).first()
    if book:
        return jsonify(notes_schema.dump(book.notes))
    else:
        return jsonify({
                        "error": "Not found",
                        "message": "No notes found"
        }), 404


@required_params("content")
@books_endpoint.route("/v1/books/<id>/notes", methods=["POST"])
@jwt_required()
def add_book_note(id):
    new_note = Notes(book_id=id, content=request.json["content"])
    new_note.save_to_db()
    return jsonify({'message': 'Note created'}), 200