from flask import Blueprint, jsonify, request, current_app, send_from_directory
from api.auth.models import User, UserSchema
from api.auth.decorators import require_role
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
import os
from werkzeug.utils import secure_filename
import uuid
from api.models import Profile

user_endpoint = Blueprint('user_endpoint', __name__)

@user_endpoint.route("/v1/users/me", methods=["GET"])
@jwt_required()
def get_logged_in_user():
    user_schema = UserSchema(many=False)
    user = User.query.filter_by(email=get_jwt_identity()).first()
    return jsonify(user_schema.dump(user))


@user_endpoint.route('/v1/users', methods=["GET"])
@require_role("internal_admin")
def get_all_users():
    user_schema = UserSchema(many=True)
    users = User.query.all()
    return jsonify(user_schema.dump(users))


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config.get("ALLOWED_PROFILE_PICTURE_EXTENSIONS")

@user_endpoint.route("/v1/users/me/profile-picture", methods=["POST"])
@jwt_required()
def upload_profile_picture():
    if 'file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400

    if file and allowed_file(file.filename):
        user = User.query.filter_by(email=get_jwt_identity()).first()
        profile = Profile.query.filter_by(owner_id=user.id).first()
        
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = secure_filename(f"user_{uuid.uuid4().hex[:8]}.{ext}")
        file_path = os.path.join(current_app.config.get("PROFILE_PICTURE_FOLDER"), filename)
        
        os.makedirs(current_app.config.get("PROFILE_PICTURE_FOLDER"), exist_ok=True)
        file.save(file_path)

        user.profile_picture = filename
        profile.profile_picture = filename
        user.save_to_db()
        profile.save_to_db()
        
        return jsonify({
            "message": "Profile picture updated successfully", 
            "profile_picture": user.profile_picture
        }), 201
    
    return jsonify({"message": "Invalid file type"}), 400


@user_endpoint.route("/v1/users/profile-picture/<filename>", methods=["GET"])
@jwt_required(optional=True)
def serve_profile_picture(filename):
    filename = os.path.basename(filename)
    profile = Profile.query.filter_by(profile_picture=filename).first()
    
    if not profile:
        return jsonify({"message": "Profile picture not found"}), 404
    
    if profile.visibility != "hidden":
        return send_from_directory(current_app.config['PROFILE_PICTURE_FOLDER'], filename)

    current_user_email = get_jwt_identity()
    if current_user_email:
        current_user = User.query.filter_by(email=current_user_email).first()
        if current_user and current_user.id == profile.owner_id:
            return send_from_directory(current_app.config['PROFILE_PICTURE_FOLDER'], filename)

    return jsonify({"message": "Profile picture not found"}), 404