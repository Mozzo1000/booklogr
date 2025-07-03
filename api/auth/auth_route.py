from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, get_jwt_identity, get_jwt)
from api.auth.models import User, UserSchema, RevokedTokenModel, Verification
import random
import string
from datetime import datetime, timedelta
import os
from api.auth.decorators import disable_route
import requests

auth_endpoint = Blueprint('auth', __name__)

@auth_endpoint.route("/v1/register", methods=["POST"])
@disable_route(os.environ.get("AUTH_ALLOW_REGISTRATION", True))
def register():
    if not "email" or not "password" or not "name" in request.json:
        abort(422)
    if User.find_by_email(request.json["email"]):
        return jsonify({'message': 'Email {} is already in use'.format(request.json["email"])}), 409
    
    new_user = User(email=request.json["email"], password=User.generate_hash(request.json["password"]), name=request.json["name"])

    # Alphanumeric (letters and numbers) string with a length of 8 characters
    code = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))

    try:
        new_user.save_to_db()
        user_id = User.find_by_email(request.json["email"]).id
        if os.environ.get("AUTH_REQUIRE_VERIFICATION", False).lower() in ["true", "yes", "y"] :
            new_verification = Verification(user_id=user_id, code=code, code_valid_until=(datetime.now() + timedelta(days=1)))
        else: 
            new_verification = Verification(user_id=user_id, status="verified", code=None, code_valid_until=None)
        new_verification.save_to_db()

        return jsonify({'message': 'Account with email {} was created'.format(request.json["email"])}), 201

    except Exception as error:
        print(error)
        return jsonify({'message': 'Something went wrong'}), 500

@auth_endpoint.route("/v1/verify", methods=["POST"])
def verify():
    if not "email" or not "code" in request.json:
        abort(422)

    current_user = User.find_by_email(request.json["email"])
    print(current_user)
    if current_user:
        verification = Verification.query.filter(Verification.user_id==current_user.id).first()
        if datetime.now() < verification.code_valid_until:
            if verification.code == request.json["code"].upper():
                try:
                    verification.status = "verified"
                    verification.code = None
                    verification.code_valid_until = None
                    verification.save_to_db()
                    return jsonify({'message': 'Verification succeeded'}), 200
                except:
                    return jsonify({'message': 'Unable to save to db, something went wrong'}), 500
            else:
                return jsonify({'message': 'Invalid verification code supplied'}), 400
        else:
            return jsonify({'message': 'Verification code has expired'}), 400
    else:
        return jsonify({'message': 'User could not be retrieved by email'}), 404

@auth_endpoint.route("/v1/login", methods=["POST"])
def login():
    if not "email" or not "password" in request.json:
        abort(422)
    current_user = User.find_by_email(request.json["email"])
    if not current_user:
        return jsonify({'message': 'Wrong email or password, please try again.'}), 404

    if User.verify_hash(request.json["password"], current_user.password) and current_user.status == "active":
        if current_user.verification.status != "verified":
            return jsonify({'message': 'Account has not been verified.'}), 403
        access_token = create_access_token(identity=request.json['email'], additional_claims={"role": current_user.role,  "id": current_user.id})
        refresh_token = create_refresh_token(identity=request.json['email'])

        user_schema = UserSchema()
        json_output = user_schema.dump(current_user)
        json_output.update({'access_token': access_token, 'refresh_token': refresh_token})
        return jsonify(json_output), 201
    elif current_user.status == "inactive":
        return jsonify({'message': 'Account has been inactivated, contact administrator for more information.'}), 403
    else:
        return jsonify({'message': 'Wrong username or password, please try again.'}), 401

@auth_endpoint.route('/v1/token/refresh', methods=['POST'])
def token_refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user, additional_claims={"role": current_user.role,  "id": current_user.id})
    return jsonify({'access_token': access_token}), 201

@auth_endpoint.route('/v1/token/logout/access', methods=['POST'])
@jwt_required()
def user_logout_access():
    jti = get_jwt()["jti"]
    try:
        revoked_token = RevokedTokenModel(jti=jti)
        revoked_token.add()
        return jsonify({'message': 'Access token has been revoked'}), 201
    except:
        return jsonify({'message': 'Something went wrong'}), 500


@auth_endpoint.route('/v1/token/logout/refresh', methods=['POST'])
@jwt_required(refresh=True)
def user_logout_refresh():
    jti = get_jwt()["jti"]
    try:
        revoked_token = RevokedTokenModel(jti=jti)
        revoked_token.add()
        return jsonify({'message': 'Refresh token has been revoked'}), 201
    except:
        return jsonify({'message': 'Something went wrong'}), 500


"""
NOTE: This is a quick n dirty way of adding a authorized redirect URI route for Google OAuth authentication.
How this is used is a frontend, ex Web app requests an authorization code from Google when a user is trying to login. When the frontend 
recieves a code from Google, the frontend then sends the code to this route to verify that the code is valid and if valid the route will login 
the user in the same way as manual login routes above. If the user does not exist it will create a user automatically.

This function reuses a lot of code from the login and register routes. It also completly ignores the verification process and will automatically assume 
the user is verified (we could use the verified key that the OAuth response from Google sends us instead).

"""
@auth_endpoint.route("/v1/authorize/google", methods=['GET','POST'])
def authorize_google():
    auth_code = request.get_json()['code']

    data = {
        'code': auth_code,
        'client_id': os.getenv("GOOGLE_CLIENT_ID"),  # client ID from the credential at google developer console
        'client_secret': os.getenv("GOOGLE_CLIENT_SECRET"),  # client secret from the credential at google developer console
        'redirect_uri': 'postmessage',
        'grant_type': 'authorization_code'
    }

    response = requests.post('https://oauth2.googleapis.com/token', data=data).json()
    headers = {
        'Authorization': f'Bearer {response["access_token"]}'
    }
    user_info = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=headers).json()
    print(user_info)
    # CREATE USER AND THEN SEND BACK NORMAL ACCESS TOKEN, SAME AS WITH NORMAL LOGIN
    current_user = User.find_by_email(user_info["email"])
    if not current_user:
        #CREATE A NEW USER
        print("CREATE NEW USER")
        random_pass = "".join(random.choices(string.ascii_letters + string.digits + string.punctuation, k=32))

        new_user = User(email=user_info["email"], password=User.generate_hash(random_pass), name=user_info["name"])

        new_user.save_to_db()
        user_id = User.find_by_email(user_info["email"])
        new_verification = Verification(user_id=user_id.id, status="verified", code=None, code_valid_until=None)
        new_verification.save_to_db()

        access_token = create_access_token(identity=user_id.email, additional_claims={"role": user_id.role, "id": user_id.id})
        refresh_token = create_refresh_token(identity=user_id.email)

        user_schema = UserSchema()
        json_output = user_schema.dump(user_id)
        json_output.update({'access_token': access_token, 'refresh_token': refresh_token})
        return jsonify(json_output), 201
    if current_user and current_user.status == "active":
        access_token = create_access_token(identity=user_info['email'], additional_claims={"role": current_user.role, "id": current_user.id})
        refresh_token = create_refresh_token(identity=user_info['email'])

        user_schema = UserSchema()
        json_output = user_schema.dump(current_user)
        json_output.update({'access_token': access_token, 'refresh_token': refresh_token})
        return jsonify(json_output), 201
    elif current_user and current_user.status == "inactive":
        return jsonify({'message': 'Account has been inactivated, contact administrator for more information.'}), 403