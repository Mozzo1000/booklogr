from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from api.models import Books, BooksSchema, NotesSchema, Notes, UserSettings, BooksStatusSchema, Profile, ReadingSessions, db
from api.decorators import required_params, auth_required
from api.routes.tasks import _create_task
import json
from sqlalchemy.exc import IntegrityError
from psycopg2.errors import ForeignKeyViolation
from datetime import datetime, timezone
from api.utils import validate_date_string, get_current_user_id
from dataclasses import dataclass, asdict
from typing import Optional
import requests
from sqlalchemy import or_
from api.extensions import cache

books_endpoint = Blueprint('books', __name__)

@dataclass
class BookData:
    isbn: str
    title: str
    in_library: bool
    total_pages: int
    library_data: Optional[dict] = None
    author: Optional[str] = None
    description: Optional[str] = None

@dataclass
class SearchResult:
    isbn: str
    title: str
    author: str
    in_library: bool

@books_endpoint.route("/v1/books/search", methods=["GET"])
@auth_required()
@cache.cached(query_string=True)
def search_books():
    search_term = request.args.get('q', '')
    if not search_term:
        return jsonify([]), 200

    claim_id = get_current_user_id()

    local_db_results = Books.query.filter(
        Books.owner_id == claim_id,
        or_(
            Books.title.ilike(f"%{search_term}%"),
            Books.author.ilike(f"%{search_term}%"),
            Books.isbn.ilike(f"%{search_term}%")
        )
    ).all()

    results = []
    seen_isbns = set()

    for b in local_db_results:
        book_obj = SearchResult(
            isbn=b.isbn,
            title=b.title,
            author=b.author,
            in_library=True,
        )
        results.append(book_obj)
        seen_isbns.add(b.isbn)

    try:
        params = {
            "q": search_term,
            "limit": 10,
            "fields": "title,isbn,author_name,cover_i",
            "lang": "en"
        }
        session = requests.Session()
        session.headers.update({"User-Agent": "BookLogr (mozzo242@gmail.com)"})

        response = session.get("https://openlibrary.org/search.json", params=params, timeout=10)
        response.raise_for_status()
        ol_docs = response.json().get("docs", [])


        for doc in ol_docs:
            if not doc.get("isbn"):
                continue
            
            isbn = doc["isbn"][0]

            if isbn in seen_isbns:
                continue
            
            existing_book = Books.query.filter_by(owner_id=claim_id, isbn=isbn).first()
            
            if existing_book:
                book_obj = SearchResult(
                    isbn=existing_book.isbn,
                    title=existing_book.title,
                    author=existing_book.author,
                    in_library=True,
                )
            else:
                book_obj = SearchResult(
                    isbn=isbn,
                    title=doc.get("title"),
                    author=doc.get("author_name")[0] if doc.get("author_name") else "Unknown",
                    in_library=False,
                )
            
            results.append(book_obj)
            seen_isbns.add(isbn)

        results.sort(key=lambda x: x.in_library, reverse=True)
        return jsonify({
            "num_found": len(results),
            "items": [asdict(b) for b in results]
        }), 200

    except requests.exceptions.RequestException:
        return jsonify([asdict(b) for b in results]), 200


@books_endpoint.route("/v1/books/<isbn>", methods=["GET"])
@auth_required()
def get_book(isbn):
    """
        Get book by isbn
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
            description: Returns book data. 
          404:
            description: No book found.
          503:
            description: Could not connect to OpenLibrary.
        
        """
    
    claim_id = get_current_user_id()
    book = Books.query.filter(Books.owner_id==claim_id, Books.isbn==isbn).first()
    if book:
        return jsonify(BookData(isbn=book.isbn, title=book.title, author=book.author, description=book.description, in_library=True, total_pages=book.total_pages, library_data={"reading_status": book.reading_status, "current_page": book.current_page, "rating": book.rating})), 200
    else:
        BASE_URL = "https://openlibrary.org"
        session = requests.Session()
        session.headers.update({"User-Agent": "BookLogr (mozzo242@gmail.com)"})
        
        try:
          response = session.get(f"{BASE_URL}/isbn/{isbn}.json", timeout=10)
          if response.status_code == 200:
              ol_data = response.json()
              
              title = ol_data.get("title")
              total_pages = ol_data.get("number_of_pages", 0)
              
              # Handle description which can be a string or a dict
              description = ol_data.get("description")
              if isinstance(description, dict):
                  description = description.get("value")
              
              # Get author name if key exists
              author_name = None
              if "authors" in ol_data and len(ol_data["authors"]) > 0:
                  author_key = ol_data["authors"][0].get("key")
                  author_res = session.get(f"{BASE_URL}{author_key}.json", timeout=5)
                  if author_res.status_code == 200:
                      author_name = author_res.json().get("name")

              # If description is missing, try to fetch from works
              if not description and "works" in ol_data and len(ol_data["works"]) > 0:
                  work_key = ol_data["works"][0].get("key")
                  work_res = session.get(f"{BASE_URL}{work_key}.json", timeout=5)
                  if work_res.status_code == 200:
                      work_data = work_res.json()
                      description = work_data.get("description")
                      if isinstance(description, dict):
                          description = description.get("value")

              return jsonify(BookData(
                  isbn=isbn, 
                  title=title, 
                  author=author_name, 
                  description=description, 
                  in_library=False, 
                  total_pages=total_pages
              )), 200
          elif response.status_code == 404:
              return jsonify({
                    "error": "Not found",
                    "message": f"No book with isbn {isbn} found."
              }), 404
        except requests.exceptions.RequestException:
            return jsonify({
                "error": "Service unavailable",
                "message": "Could not connect to OpenLibrary"
            }), 503


@books_endpoint.route("/v1/books/<isbn>/status", methods=["GET"])
@auth_required()
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
    claim_id = get_current_user_id()
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
@auth_required()
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

    claim_id = get_current_user_id()
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
@auth_required()
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
                      - Did not finish
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

    claim_id = get_current_user_id()

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

      if reading_status in ("Currently reading", "Read", "Did not finish"):
        new_session = ReadingSessions(book_id=new_book.id, status="Currently reading")

        if request.json["reading_status"] in ("Read", "Did not finish"):
          new_session.end_date = datetime.now(timezone.utc)
          new_session.status = request.json["reading_status"]
        new_session.save_to_db()

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
@auth_required()
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
                  title:
                    type: string
                  author:
                    type: string
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
    
    claim_id = get_current_user_id()
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
            if request.json["status"] in ("Currently reading", "To be read", "Read", "Did not finish"):
                active_session = ReadingSessions.get_active(id, claim_id)
                book.reading_status = request.json["status"]

                print(active_session)

                if request.json["status"] == "Currently reading":
                  if not active_session:
                      new_session = ReadingSessions(book_id=id, status="Currently reading")
                      new_session.save_to_db()
                elif request.json["status"] in ("Read", "Did not finish"):
                  if active_session:
                      active_session.end_date = datetime.now(timezone.utc)
                      active_session.status = request.json["status"]

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
        if "title" in request.json:
            book.title = request.json["title"]
        if "author" in request.json:
            book.author = request.json["author"]
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
@auth_required()
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
    claim_id = get_current_user_id()
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
@auth_required()
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
    claim_id = get_current_user_id()
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
@auth_required()
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
          404:
            description: No book found.
          422:
            description: Invalid date format.
    """

    claim_id = get_current_user_id()
    owns_book = Books.query.filter(Books.owner_id==claim_id, Books.id==id).first()

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
    if owns_book:
        new_note = Notes(book_id=id, content=request.json["content"], quote_page=page, created_on=created_on, visibility=visibility)
        new_note.save_to_db()
        return jsonify({'message': 'Note created'}), 200
    else:
        return jsonify({
                    "error": "Not found",
                    "message": "No book found"
        }), 404