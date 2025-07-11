from flask import Blueprint, request, jsonify, abort, current_app, render_template_string
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, get_jwt_identity, get_jwt)
from api.auth.models import User, UserSchema, RevokedTokenModel, Verification
import random
import string
from datetime import datetime, timedelta
import os
from api.auth.decorators import disable_route
import requests
from flask_mail import Mail, Message

auth_endpoint = Blueprint('auth', __name__)
mail = Mail()

@auth_endpoint.route("/v1/register", methods=["POST"])
@disable_route(os.environ.get("AUTH_ALLOW_REGISTRATION", "True"))
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
        if os.environ.get("AUTH_REQUIRE_VERIFICATION", "False").lower() in ["true", "yes", "y"] :
            new_verification = Verification(user_id=user_id, code=code, code_valid_until=(datetime.now() + timedelta(days=1)))
            _send_verification_email(request.json["name"], request.json["email"], code)
        else: 
            new_verification = Verification(user_id=user_id, status="verified", code=None, code_valid_until=None)
        new_verification.save_to_db()

        return jsonify({'message': 'Account with email {} was created'.format(request.json["email"]), "status": new_verification.status}), 201

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
    
    if not current_app.config["GOOGLE_CLIENT_ID"] and not current_app.config["GOOGLE_CLIENT_SECRET"]:
        return jsonify({'message': 'Google login has not been properly setup.'}), 500
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
    

def _send_verification_email(name, recipient_email, code):
    msg = Message(
        subject="Your BookLogr Verification Code",
        recipients=[recipient_email],
        html = render_template_string("""
            <html>
                <head>
                    <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        background-color: #f9fafb;
                        color: #374151;
                        margin: 0;
                        padding: 0;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border: 1px solid #e5e7eb;
                        padding: 40px;
                        border-radius: 8px;
                    }
                    .header {
                        color: #0891b2;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .message {
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .code-box {
                        background-color: #e0f2f9;
                        color: #0891b2;
                        font-size: 20px;
                        font-weight: bold;
                        padding: 16px;
                        text-align: center;
                        border-radius: 6px;
                        margin: 20px 0;
                    }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">Welcome to BookLogr</div>
                        <div class="message">
                            <p>Hi {{name}},</p>
                            <p>To verify your account, please use the code below:</p>
                            <div class="code-box">{{code}}</div>
                            <p>This verification code is valid for 24 hours.</p>
                        </div>
                    </div>
                </body>
            </html>
            """, name=name, code=code),
        
        body = f"""
            Hi {name},
            Your verification code is: {code}
            This code is valid for 24 hours.
            """
    )
    mail.send(msg)