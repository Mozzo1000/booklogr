from flask import Blueprint, send_from_directory, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from api.models import Files, FilesSchema
import os

files_endpoint = Blueprint('files', __name__)

@files_endpoint.route("/v1/files/<filename>", methods=["GET"])
@jwt_required()
def download_file(filename):
    """
        Download file
        ---
        tags:
            - Files
        parameters:
            - name: filename
              in: path
              type: string
              required: true
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Returns file.
          500:
            description: Unknown error occurred.
    """
    claim_id = get_jwt()["id"]
    file = Files.query.filter(Files.filename==filename, Files.owner_id==claim_id).first()

    if file:
        return send_from_directory(os.getenv("EXPORT_FOLDER"), filename, as_attachment=True)
    else:
         return jsonify({
                "error": "Unkown error",
                "message": "Unkown error occurred"
    }), 500



@files_endpoint.route("/v1/files", methods=["GET"])
@jwt_required()
def get_files():
    """
        Get list of files
        ---
        tags:
            - Files
        security:
            - bearerAuth: []         
        responses:
          200:
            description: Returns list of files.
          404:
            description: No files could be found.
    """
    claim_id = get_jwt()["id"]
    file_schema = FilesSchema(many=True)
    files = Files.query.filter(Files.owner_id==claim_id).order_by(Files.created_at.desc()).all()

    if files:
        return file_schema.dump(files)
    else:
         return jsonify({
                "error": "Not found",
                "message": "No files found"
    }), 404

