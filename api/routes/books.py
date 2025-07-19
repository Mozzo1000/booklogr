from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from api.models import Books, BooksSchema, NotesSchema, Notes, UserSettings, BooksStatusSchema, Profile, db
from api.decorators import required_params
from api.routes.tasks import _create_task
import json
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import ForeignKeyViolation
from datetime import datetime, timezone
from api.utils import validate_date_string

books_endpoint = Blueprint('books', __name__)

@books_endpoint.route("/v1/books/<isbn>", methods=["GET"])
@jwt_required()
def get_book_reading_status(isbn):
    """
        Check if book (by isbn) is already in a list.
        ---
        tags:
            - Books
        parameters:
            - name: isbn
              in: path
              description: ISBN of book
              required: true
              schema:
                type: integer
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Returns book id and what list it is in.
          404:
            description: Returns error and message, no book found in any reading list.
    """
    claim_id = get_jwt()["id"]
    book = Books.query.filter(Books.owner_id==claim_id, Books.isbn==isbn).first()
    books_status_schema = BooksStatusSchema(many=False)
    if book:
        return jsonify(books_status_schema.dump(book))
    else:
        return jsonify({
                    "error": "Not found",
                    "message": f"No book with isbn {isbn} found in any reading list."
        }), 404

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
              required: false
              schema:
                type: string
            - name: sort_by
              in: query
              schema:
                type: string
              description: Field to sort by (progress, created_on, title, author, rating, reading_status, isbn)
              required: false
            - name: order
              in: query
              schema:
                type: string
              description: Sorting order (asc or desc)
              required: false
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Returns books in list
    """
    sort_fields = {"progress", "created_on", "title", "author", "rating", "reading_status", "isbn"}
    order_fields = {"asc", "desc"}

    limit = 25
    offset = request.args.get('offset', 1, type=int)
    if request.args.get("limit"):
        limit = request.args.get("limit")

    claim_id = get_jwt()["id"]
    query_status = request.args.get("status")
    sort_by = request.args.get("sort_by", "title")
    order = request.args.get("order", "asc")

    if sort_by not in sort_fields:
      return jsonify({
                  'error': 'Invalid sort field',
                  'message': 'Sort can be only one of the following fields: progress, created_on, title, author, rating, reading_status, isbn'
              }), 400
    
    if order not in order_fields:
      return jsonify({
                  'error': 'Invalid order field',
                  'message': 'Order can be only one of the following fields: asc, desc'
              }), 400
    
  
    books_schema = BooksSchema(many=True)
    books = Books.query.filter(Books.owner_id == claim_id)

    if query_status:
        books = books.filter(Books.reading_status==query_status)
    
    if sort_by in sort_fields:
        if sort_by == "progress":
          progress_calc = (Books.current_page * 100.0 / Books.total_pages).label('progress')
          if order == "asc":
            books = books.order_by(progress_calc.asc()).paginate(page=offset, per_page=limit, error_out=False)
          else:
              books = books.order_by(progress_calc.desc()).paginate(page=offset, per_page=limit, error_out=False)
        else:
          if order == "asc":
            books = books.order_by(getattr(Books, sort_by).asc()).paginate(page=offset, per_page=limit, error_out=False)
          else:
            books = books.order_by(getattr(Books, sort_by).desc()).paginate(page=offset, per_page=limit, error_out=False)

    return jsonify({"items": books_schema.dump(books.items), "meta": {
            "page": books.page,
            "per_page": books.per_page,
            "total_items": books.total,
            "total_pages": books.pages,
            "has_next": books.has_next,
            "has_prev": books.has_prev,
            "offset": (books.page - 1) * books.per_page
        }})

@required_params("title", "isbn")
@books_endpoint.route("/v1/books", methods=["POST"])
@jwt_required()
def add_book():
    """
        Add book to list
        ---
        tags:
            - Books
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                required:
                  - title
                  - isbn
                properties:
                  title:
                    type: string
                    description: Title of the book
                  isbn:
                    type: string
                    description: ISBN number
                  author:
                    type: string
                    description: Author of the book
                  description:
                    type: string
                    description: Description of the book
                  reading_status:
                    type: string
                    description: Reading status
                    enum:
                      - To be read
                      - Currently reading
                      - Read
                    default: To be read
                  current_page:
                    type: integer
                    description: Current page being read
                    default: 0
                  total_pages:
                    type: integer
                    description: Total number of pages
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

    try:
      new_book = Books(owner_id=claim_id, title=request.json["title"], isbn=request.json["isbn"], 
                      description=description, reading_status=reading_status, 
                      current_page=current_page, total_pages=total_pages, author=author)
      new_book.save_to_db()
    except IntegrityError as e:
        db.session.rollback()
        if isinstance(e.orig, ForeignKeyViolation):
            prof = Profile.query.filter_by(owner_id=claim_id).first()
            if prof is None:
              return jsonify({
                  'error': 'Foreign key violation',
                  'message': 'A profile does not exist. Please create one before trying to add a book.'
              }), 409
        
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
              required: true
              schema:
               type: integer
        requestBody:
          required: false
          content:
            application/json:
              schema:
                type: object
                properties:
                  current_page:
                    type: integer
                  status:
                    type: string
                  rating:
                    type: number
                    format: float
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
        if "total_pages" in request.json:
            if isinstance(request.json["total_pages"], int):
                book.total_pages = request.json["total_pages"]
            else:
                return jsonify({"error": "Unprocessable entity", "message": "Can't process change. Total pages must be an integer."}), 422
        if "status" in request.json:
            if request.json["status"] in ("Currently reading", "To be read", "Read"):
                book.reading_status = request.json["status"]

                if UserSettings.query.filter(UserSettings.owner_id==claim_id, UserSettings.send_book_events==True).first():
                  if book.reading_status == "Read":
                    _create_task("share_book_event", json.dumps({"title": book.title, "author": book.author, "reading_status": book.reading_status}), claim_id)

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
              schema:
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
              schema:
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
        return jsonify(notes_schema.dump(sorted(book.notes, key=lambda x: x.created_on, reverse=True)))
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
              schema:
                type: integer
              required: true
        requestBody:
          required: true
          content:
            application/json:
              schema:
                type: object
                required:
                  - content
                properties:
                  content:
                    type: string
                    description: Content of the note
                  visibility:
                    type: string
                    description: Visibility of the note (hidden or public)
                  created_on:
                    type: string
                    format: date-time
                    description: Date of note creation (optional)
        security:
            - bearerAuth: []
        responses:
          200:
            description: Note created.
    """

    page = None
    created_on = datetime.now(timezone.utc)
    visibility = "hidden"
    if "quote_page" in request.json:
        page = request.json["quote_page"]
    if "visibility" in request.json:
        if "hidden" or "public" in request.json["visibility"]:
          visibility = request.json["visibility"]
        else:
            return jsonify({
                "error": "Invalid visibility",
                "message": "The supplied visibility is invalid. It can be either hidden or public."
            }), 422
    if "created_on" in request.json:
      parsed = validate_date_string(request.json["created_on"])
      if parsed:
          created_on = parsed
      else:
           return jsonify({
                "error": "Invalid date format.",
                "message": "The date format is invalid. Accepted formats: 'YYYY-MM-DD', 'YYYY-MM-DD HH:MM:SS', or 'YYYY-MM-DD HH:MM:SS.ssssss'."
            }), 422
    
    new_note = Notes(book_id=id, content=request.json["content"], quote_page=page, created_on=created_on, visibility=visibility)
    new_note.save_to_db()
    return jsonify({'message': 'Note created'}), 200