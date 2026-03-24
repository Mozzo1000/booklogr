from flask import Blueprint, request, jsonify
from api.models import UserSettings, UserSettingsSchema
from api.decorators import auth_required
from api.utils import get_current_user_id
import time
from datetime import datetime, timezone

settings_endpoint = Blueprint('settings', __name__)

@settings_endpoint.route("/v1/settings", methods=["GET"])
@auth_required()
def get_settings():
    claim_id = get_current_user_id()
    user_settings_schema = UserSettingsSchema(many=False)
    user_settings = UserSettings.query.filter(UserSettings.owner_id==claim_id).first()
    if user_settings:
        return jsonify(user_settings_schema.dump(user_settings))
    else:
        return jsonify({
                    "error": "Not found",
                    "message": "User settings not found"
        }), 404
    
@settings_endpoint.route("/v1/settings", methods=["PATCH"])
@auth_required()
def edit_settings():
    claim_id = get_current_user_id()

    user_settings = UserSettings.query.filter(UserSettings.owner_id==claim_id).first()
    if user_settings:
        if request.json:
            if "send_book_events" in request.json:
                user_settings.send_book_events = request.json["send_book_events"]
            if "mastodon_url" in request.json:
                user_settings.mastodon_url = request.json["mastodon_url"]
            if "mastodon_access_token" in request.json:
                user_settings.mastodon_access_token = request.json["mastodon_access_token"]
            
            user_settings.updated_on = datetime.now(timezone.utc)
            user_settings.save_to_db()
            return jsonify({'message': 'User settings updated'}), 200
        else:
            return jsonify({
                        "error": "Bad request",
                        "message": "send_book_events, mastodon_url and/or mastodon_access_token not given."
            }), 40
    else:
        return jsonify({
                    "error": "Not found",
                    "message": "User settings not found."
        }), 404