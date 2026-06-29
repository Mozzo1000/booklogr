from flask import Blueprint, request, jsonify
from api.models import Notes, Books
from api.utils import get_current_user_id
from api.decorators import auth_required

notes_endpoint = Blueprint('notes', __name__)

@notes_endpoint.route("/v1/notes/<id>", methods=["DELETE"])
@auth_required()
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
    claim_id = get_current_user_id()
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
@auth_required()
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
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Note changed sucessfully.

          500:
            description: Unknown error.
    """
    claim_id = get_current_user_id()
    note = Notes.query.join(Books, Books.id==Notes.book_id).filter(Books.owner_id==claim_id, Notes.id==id).first()
    if request.json:
        if "visibility" in request.json:
            if request.json["visibility"] in ("hidden", "public"):
                note.visibility = request.json["visibility"]
            else:
                return jsonify({
                    "error": "Invalid visibility",
                    "message": "The supplied visibility is invalid. It can be either hidden or public."
                }), 422
        if "content" in request.json:
            note.content = request.json["content"]
        if "quote_page" in request.json:
            note.quote_page = request.json["quote_page"]
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
