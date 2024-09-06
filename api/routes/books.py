from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from api.models import Books, BooksSchema, NotesSchema, Notes
from api.decorators import required_params

books_endpoint = Blueprint('books', __name__)

@books_endpoint.route("/v1/books", methods=["GET"])
@jwt_required()
def get_books():
    """
        Get books in list
        ---
        tags:
            - Books
        parameters:
            - name: status
              in: query
              type: string
              required: false
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Returns books in list
    """
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
        Add book to list
        ---
        tags:
            - Books
        parameters:
            - name: title
              in: body
              type: string
              required: true
            - name: isbn
              in: body
              type: string
              required: true
            - name: author
              in: body
              type: string
              required: false
            - name: description
              in: body
              type: string
              required: false
            - name: reading_status
              in: body
              type: string
              required: false
              default: To be read
            - name: current_page
              in: body
              type: integer
              required: false
              default: 0
            - name: total_pages
              in: body
              type: integer
              required: false
              default: 0
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Book added to list.
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
    """
        Edit book
        ---
        tags:
            - Books
        parameters:
            - name: id
              in: path
              description: ID of book (NOT ISBN)
              type: integer
              required: true
            - name: current_page
              in: body
              type: string
              required: false
            - name: status
              in: body
              type: string
              required: false
            - name: rating
              in: body
              type: number
              required: false
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Book changed successfully.
          409:
            description: Recieved no JSON in body.
          500:
            description: Unknown error occurred.
    """
    
    claim_id = get_jwt()["id"]
    book = Books.query.filter(Books.owner_id==claim_id, Books.id==id).first()
    if request.json:
        if "current_page" in request.json:
            if int(request.json["current_page"]) <= book.total_pages:
                book.current_page = request.json["current_page"]
            else:
                return jsonify({"error": "Unprocessable entity", "message": "Can't process change. The current page is greater than total pages."}), 422 
            if int(request.json["current_page"]) < 0:
                return jsonify({"error": "Unprocessable entity", "message": "Can't process change. The current page can't be less than 0."}), 422 
        if "status" in request.json:
            if request.json["status"] in ("Currently reading", "To be read", "Read"):
                book.reading_status = request.json["status"]
            else: 
                return jsonify({"error": "Unprocessable entity", "message": "Can't process change. Status needs to be either 'Currently reading', 'To be read' or 'Read' (case sensitive)"}), 422 

        if "rating" in request.json:
            if 0 <= float(request.json["rating"]) <= 5:
                book.rating = request.json["rating"]
            elif int(request.json["rating"]) > 5:
                return jsonify({"error": "Unprocessable entity", "message": "Can't process change. Rating can't be more than 5."}), 422 
            elif int(request.json["rating"]) < 0:
                return jsonify({"error": "Unprocessable entity", "message": "Can't process change. Rating can't be less than 0."}), 422 
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
    """
        Remove book from list
        ---
        tags:
            - Books
        parameters:
            - name: id
              in: path
              description: ID of book (NOT ISBN)
              type: integer
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Book removed successfully.
          404:
            description: Could not find any book with the supplied ID.
    """
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
    """
        Get notes from book
        ---
        tags:
            - Books
        parameters:
            - name: id
              in: path
              description: ID of book (NOT ISBN)
              type: integer
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Returns notes attached to the book.
          404:
            description: Notes could not be found.
    """
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
    """
        Add note to book
        ---
        tags:
            - Books
        parameters:
            - name: id
              in: path
              description: ID of book (NOT ISBN)
              type: integer
              required: true
            - name: content
              in: body
              description: Content of the note
              type: string
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Note created.
    """
    new_note = Notes(book_id=id, content=request.json["content"])
    new_note.save_to_db()
    return jsonify({'message': 'Note created'}), 200