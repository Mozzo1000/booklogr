from flask import Blueprint, jsonify
from api.auth.models import User, UserSchema
from api.auth.decorators import require_role
from flask_jwt_extended import jwt_required, get_jwt_identity

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