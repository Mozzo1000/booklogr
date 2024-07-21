from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from api.models import Profile, ProfileSchema, Notes, Books
from api.decorators import required_params

profiles_endpoint = Blueprint('profiles', __name__)

@profiles_endpoint.route("/v1/profiles/<display_name>", methods=["GET"])
def get_profile(display_name):
    profile_schema = ProfileSchema()
    
    profile = Profile.query.join(Profile.books).join(Books.notes).filter(Profile.display_name==display_name, Profile.visibility=="public", Notes.visibility=="public").first()
    if profile:
        return jsonify(profile_schema.dump(profile))

    else:
        return jsonify({
                    "error": "Not found",
                    "message": "No profile found"
        }), 404
    
@profiles_endpoint.route("/v1/profiles", methods=["GET"])
@jwt_required()
def get_profile_by_logged_in_id():
    claim_id = get_jwt()["id"]
    profile_schema = ProfileSchema()
    
    profile = Profile.query.filter(Profile.owner_id==claim_id).first()
    if profile:
        return jsonify(profile_schema.dump(profile))

    else:
        return jsonify({
                    "error": "Not found",
                    "message": "You have not created a profile yet"
        }), 404

@required_params("display_name")
@profiles_endpoint.route("/v1/profiles", methods=["POST"])
@jwt_required()
def create_profile():
    claim_id = get_jwt()["id"]

    profile = Profile.query.filter(Profile.owner_id==claim_id).first()
    if profile:
        return jsonify({
                    "error": "Conflict",
                    "message": "Profile already exists"
        }), 409
    
        
    else:
        visibility = "hidden"
        if "visibility" in request.json:
            if "hidden" or "public" in request.json["visibility"]:
                visibility = request.json["visibility"]
        new_profile = Profile(owner_id=claim_id, display_name=request.json["display_name"], visibility=visibility)
        new_profile.save_to_db()
        return jsonify({'message': 'Profile created'}), 200

@profiles_endpoint.route("/v1/profiles", methods=["PATCH"])
@jwt_required()
def edit_profile():
    claim_id = get_jwt()["id"]

    profile = Profile.query.filter(Profile.owner_id==claim_id).first()
    if profile:
        if request.json:
            if "display_name" in request.json:
                profile.display_name = request.json["display_name"]
            if "visibility" in request.json:
                if "hidden" or "public" in request.json["visibility"]:
                    profile.visibility = request.json["visibility"]
            profile.save_to_db()
            return jsonify({'message': 'Profile updated'}), 200
        else:
            return jsonify({
                        "error": "Bad request",
                        "message": "display_name and/or visibility not given"
            }), 40

    else:
        return jsonify({
                    "error": "Not found",
                    "message": "No profile was found."
        }), 404