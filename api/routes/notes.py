from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from api.models import Notes, NotesSchema, Books

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
              type: integer
              required: true
            - name: visibility
              in: body
              type: string
              required: true
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