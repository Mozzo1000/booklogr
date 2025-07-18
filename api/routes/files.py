from flask import Blueprint, send_from_directory, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt
from api.models import Files, FilesSchema, Books
import os
import csv

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
              schema:
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
        return send_from_directory(os.path.join(os.getcwd(), current_app.config["EXPORT_FOLDER"]), filename, as_attachment=True)
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

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]

@files_endpoint.route("/v1/files", methods=["POST"])
@jwt_required()
def upload_file_for_import():
    claim_id = get_jwt()["id"]

    if "file" not in request.files:
        return jsonify({
                "error": "Invalid file submission",
                "message": "The 'file' field is required and must contain a valid file."
        }), 422
    
    if "type" not in request.form:
        return jsonify({
                "error": "Invalid file submission",
                "message": "The 'type' field is required and must contain a valid entry (csv)."
        }), 422

    file = request.files["file"]
    if file.filename == "":
        return jsonify({
                "error": "Missing file",
                "message": "No file was uploaded. Please include a file in the 'file' field of the request."
        }), 500

    if file and allowed_file(file.filename):
        count_imported = 0
        allow_duplicates = False
        if request.form.get("allow_duplicates") == "true":
            allow_duplicates = True
        
        if request.form.get("type") == "csv":
            required_headers = {"title", "isbn", "description", "reading_status", "current_page", "total_pages", "author", "rating"}

            stream = file.stream.read().decode("utf-8").splitlines()
            reader = csv.DictReader(stream)

            missing = required_headers - set(reader.fieldnames)
            if missing:
                return jsonify({
                    "error": "Missing required headers",
                    "message": f"The uploaded CSV file is missing the following headers: {str(list(missing))}"
                }), 400
            
            for row in reader:
                if allow_duplicates:
                    new_book = Books(owner_id=claim_id, title=row["title"], isbn=row["isbn"], 
                            description=row["description"], reading_status=row["reading_status"], 
                            current_page=row["current_page"], total_pages=row["total_pages"], author=row["author"])
                    new_book.save_to_db()
                    count_imported += 1
                else:
                    existing_book = Books.query.filter_by(owner_id=claim_id, isbn=row["isbn"]).first()
                    if not existing_book:
                        new_book = Books(owner_id=claim_id, title=row["title"], isbn=row["isbn"], 
                            description=row["description"], reading_status=row["reading_status"], 
                            current_page=row["current_page"], total_pages=row["total_pages"], author=row["author"])
                        new_book.save_to_db()
                        count_imported += 1
                    else:
                        print(f"Book with ISBN {row['isbn']} already exists. Skipping import.")
            return jsonify({"message": f"Imported {count_imported}/{reader.line_num-1} books."})

        elif request.form.get("type") == "goodreads":
            required_headers = {"Title", "ISBN13", "Author", "My Rating", "Number of Pages", "Exclusive Shelf"}

            stream = file.stream.read().decode("utf-8").splitlines()
            reader = csv.DictReader(stream)

            missing = required_headers - set(reader.fieldnames)
            if missing:
                return jsonify({
                    "error": "Missing required headers",
                    "message": f"The uploaded CSV file is missing the following headers: {str(list(missing))}"
                }), 400
            
            for row in reader:
                if row["Exclusive Shelf"] == "to-read":
                    reading_status = "To be read"
                elif row["Exclusive Shelf"] == "read":
                    reading_status = "Read"
                elif row["Exclusive Shelf"] == "currently-reading":
                    reading_status = "Currently reading"
                elif row["Exclusive Shelf"] == "on-hold":
                    reading_status = None
                
                # "=""0393254542"""
                isbn = row["ISBN13"].replace('"', "").replace("=", "")
                if isbn and reading_status:
                    if allow_duplicates:
                        new_book = Books(owner_id=claim_id, title=row["Title"], isbn=isbn, reading_status=reading_status, 
                                    current_page=0, total_pages=row["Number of Pages"], author=row["Author"])
                        new_book.save_to_db()
                        count_imported += 1
                    else:
                        existing_book = Books.query.filter_by(owner_id=claim_id, isbn=isbn).first()
                        if not existing_book:
                            new_book = Books(owner_id=claim_id, title=row["Title"], isbn=isbn, reading_status=reading_status, 
                                    current_page=0, total_pages=row["Number of Pages"], author=row["Author"])
                            new_book.save_to_db()
                            count_imported += 1
                        else:
                            print(f"Book with ISBN {isbn} already exists. Skipping import.")
                else:
                    print(f"No ISBN found for book {row["Title"]}")
            return jsonify({"message": f"Imported {count_imported}/{reader.line_num-1} books."})
        else:
            return jsonify({
                "error": "Invalid value",
                "message": "type must be one of the following, csv."
            }), 400

