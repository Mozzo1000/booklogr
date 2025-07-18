from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from api.models import Notes, NotesSchema, Books
from api.utils import validate_date_string

notes_endpoint = Blueprint('notes', __name__)

@notes_endpoint.route("/v1/notes/<id>", methods=["DELETE"])
@jwt_required()
def remove_note(id):
    """
        Delete note
        ---
        tags:
            - Notes
        parameters:
            - name: id
              in: path
              schema:
                type: integer
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Note removed successfully.

          404:
            description: No note found.
    """
    claim_id = get_jwt()["id"]
    note = Notes.query.join(Books, Books.id==Notes.book_id).filter(Books.owner_id==claim_id, Notes.id==id).first()
    if note:
        note.delete()
        return jsonify({'message': 'Note removed successfully'}), 200
    else:
        return jsonify({
                    "error": "Not found",
                    "message": f"No note with ID: {id} was found"
        }), 404


@notes_endpoint.route("/v1/notes/<id>", methods=["PATCH"])
@jwt_required()
def edit_note(id):
    """
        Edit note
        ---
        tags:
            - Notes
        parameters:
            - name: id
              in: path
              schema:
                type: integer
              required: true
        requestBody:
          required: false
          content:
            application/json:
              schema:
                type: object
                properties:
                  visibility:
                    type: string
                  content:
                    type: string
                    description: Note content
                  quote_page:
                    type: integer
                    description: Page of the quote
                  created_on:
                    type: string
                    format: date-time
                    description: Date of note creation (optional)
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Note changed sucessfully.

          500:
            description: Unknown error.
    """
    claim_id = get_jwt()["id"]
    note = Notes.query.join(Books, Books.id==Notes.book_id).filter(Books.owner_id==claim_id, Notes.id==id).first()
    if request.json:
        if "visibility" in request.json:
            note.visibility = request.json["visibility"]
        if "content" in request.json:
            note.content = request.json["content"]
        if "quote_page" in request.json:
            note.quote_page = request.json["quote_page"]
        if "created_on" in request.json:
          parsed = validate_date_string(request.json["created_on"])
          if parsed:
              note.created_on = parsed
          else:
              return jsonify({
                    "error": "Invalid date format.",
                    "message": "The date format is invalid. Accepted formats: 'YYYY-MM-DD', 'YYYY-MM-DD HH:MM:SS', or 'YYYY-MM-DD HH:MM:SS.ssssss'."
                }), 422
    else:
        return jsonify({
                    "error": "Bad request",
                    "message": "Received no json"
        }), 400
    try:
        note.save_to_db()
        return jsonify({'message': 'Note changed sucessfully'}), 200
    except:
        return jsonify({
                "error": "Unkown error",
                "message": "Unkown error occurred"
    }), 500