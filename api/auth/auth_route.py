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
from api.decorators import required_params
from api.utils import is_valid_email
from api.config import Config

auth_endpoint = Blueprint('auth', __name__)
mail = Mail()

@auth_endpoint.route("/v1/register", methods=["POST"])
@disable_route(os.environ.get("AUTH_ALLOW_REGISTRATION", "True"))
def register():
    """
    Register a new user
    ---
    tags:
      - Auth
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password, name]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
                format: password
              name:
                type: string
    responses:
      201:
        description: Account created successfully.
      409:
        description: Email already in use.
      422:
        description: Missing required fields.
      500:
        description: Internal server error.
    """
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
        if current_app.config.get("AUTH_REQUIRE_VERIFICATION").lower() in ["true", "yes", "y"] and Config.can_send_email():
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
    """
    Verify account
    ---
    tags:
      - Auth
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, code]
            properties:
              email:
                type: string
              code:
                type: string
                description: 8-character alphanumeric code sent via email.
    responses:
      200:
        description: Verification succeeded.
      400:
        description: Invalid or expired code.
      404:
        description: User not found.
      422:
        description: Missing email or code.
      500:
        description: Internal server error.
    """
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
    """
    Login user
    ---
    tags:
      - Auth
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
              password:
                type: string
    responses:
      201:
        description: Login successful. Returns tokens and user data.
      401:
        description: Invalid credentials.
      403:
        description: Account unverified or inactivated.
      404:
        description: Missing email or password.
    """
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
@jwt_required(refresh=True)
def token_refresh():
    """
    Refresh Access Token
    ---
    tags:
      - Auth
    security:
      - bearerAuth: []
    responses:
      201:
        description: New access token generated.
    """
    current_user = User.find_by_email(get_jwt_identity())

    access_token = create_access_token(identity=current_user.email, additional_claims={"role": current_user.role,  "id": current_user.id})
    refresh_token = create_refresh_token(identity=current_user.email)
    return jsonify({'access_token': access_token, 'refresh_token': refresh_token}), 201

@auth_endpoint.route('/v1/token/logout/access', methods=['POST'])
@jwt_required()
def user_logout_access():
    """
    Logout (Revoke Access Token)
    ---
    tags:
      - Auth
    security:
      - bearerAuth: []
    responses:
      201:
        description: Access token revoked.
      500:
        description: Internal server error.
    """
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
    """
    Logout (Revoke Refresh Token)
    ---
    tags:
      - Auth
    security:
      - bearerAuth: []
    responses:
      201:
        description: Refresh token revoked.
      500:
        description: Internal server error.
    """
    jti = get_jwt()["jti"]
    try:
        revoked_token = RevokedTokenModel(jti=jti)
        revoked_token.add()
        return jsonify({'message': 'Refresh token has been revoked'}), 201
    except:
        return jsonify({'message': 'Something went wrong'}), 500


@auth_endpoint.route("/v1/account/password", methods=["patch"])
@jwt_required()
@required_params("current_password", "new_password")
def change_password():
    """
    Change password
    ---
    tags:
      - Auth
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [current_password, new_password]
            properties:
              current_password:
                type: string
              new_password:
                type: string
    responses:
      201:
        description: Password updated.
      401:
        description: Current password incorrect.
    """
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if User.verify_hash(request.json["current_password"], user.password):
        user.password = User.generate_hash(request.json["new_password"])
        user.save_to_db()
        return jsonify({'message': 'Password changed'}), 201
    else:
        return jsonify({'message': 'Current password is incorrect'}), 401

@auth_endpoint.route("/v1/account/email", methods=["PATCH"])
@jwt_required()
@required_params("new_email")
def change_email():
    """
    Change email
    ---
    tags:
      - Auth
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [new_email]
            properties:
              new_email:
                type: string
                format: email
    responses:
      201:
        description: Email updated.
      400:
        description: Invalid email or same as current.
      409:
        description: Email already taken by another user.
      500:
        description: Internal server error.
    """
    user = User.query.filter_by(email=get_jwt_identity()).first()
    if not is_valid_email(request.json["new_email"]):
        return jsonify({'message': 'Invalid email'}), 400

    if user.email == request.json["new_email"]:
        return jsonify({"message": "This is already your current email"}), 400

    existing_user = User.query.filter_by(email=request.json["new_email"]).first()
    if existing_user:
        return jsonify({"message": "This email is already registered to another account."}), 409

    user.email = request.json["new_email"]
    try:
        user.save_to_db()
    except:
        return jsonify({'message': 'Something went wrong'}), 500
    return jsonify({'message': 'Email updated successfully'}), 201


@auth_endpoint.route("/v1/authorize/oidc", methods=['POST'])
def authorize_oidc():
    auth_code = request.get_json().get('code')

    discovery_url = os.getenv("OIDC_DISCOVERY_URL")
    oidc_config = None
    try:
        response = requests.get(discovery_url)
        response.raise_for_status()
        oidc_config = response.json()
    except Exception as e:
        print(f"Failed to fetch OIDC config: {e}")
        oidc_config = None

    client_id = os.getenv("OIDC_CLIENT_ID")
    client_secret = os.getenv("OIDC_CLIENT_SECRET")
    redirect_uri = os.getenv("OIDC_REDIRECT_URI") # Must match frontend redirect

    if not all([client_id, client_secret, oidc_config]):
        return jsonify({'message': 'OIDC provider not configured.'}), 500

    token_endpoint = oidc_config.get('token_endpoint')
    userinfo_endpoint = oidc_config.get('userinfo_endpoint')

    token_data = {
        'code': auth_code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
    }

    token_res = requests.post(token_endpoint, data=token_data)
    if token_res.status_code != 200:
        return jsonify({'message': 'Failed to fetch tokens from OIDC provider'}), 401
    
    tokens = token_res.json()

    headers = {'Authorization': f'Bearer {tokens["access_token"]}'}
    user_info = requests.get(userinfo_endpoint, headers=headers).json()

    email = user_info.get('email')
    name = user_info.get('name', email.split('@')[0])
    
    current_user = User.find_by_email(email)
    if not current_user:
        #CREATE A NEW USER
        print("CREATE NEW USER")
        random_pass = "".join(random.choices(string.ascii_letters + string.digits + string.punctuation, k=32))

        new_user = User(email=email, password=User.generate_hash(random_pass), name=name)

        new_user.save_to_db()
        user_id = User.find_by_email(email)
        new_verification = Verification(user_id=user_id.id, status="verified", code=None, code_valid_until=None)
        new_verification.save_to_db()

        access_token = create_access_token(identity=user_id.email, additional_claims={"role": user_id.role, "id": user_id.id})
        refresh_token = create_refresh_token(identity=user_id.email)

        user_schema = UserSchema()
        json_output = user_schema.dump(user_id)
        json_output.update({'access_token': access_token, 'refresh_token': refresh_token})
        return jsonify(json_output), 201
    if current_user and current_user.status == "active":
        access_token = create_access_token(identity=email, additional_claims={"role": current_user.role, "id": current_user.id})
        refresh_token = create_refresh_token(identity=email)

        user_schema = UserSchema()
        json_output = user_schema.dump(current_user)
        json_output.update({'access_token': access_token, 'refresh_token': refresh_token})
        return jsonify(json_output), 201
    elif current_user and current_user.status == "inactive":
        return jsonify({'message': 'Account has been inactivated, contact administrator for more information.'}), 403
    

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
    """
    Google OAuth Authorization
    ---
    tags:
      - Auth
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [code]
            properties:
              code:
                type: string
                description: Authorization code received from Google frontend.
    responses:
      201:
        description: Successfully authenticated via Google.
      403:
        description: Account is inactive.
      500:
        description: Google setup error.
    """
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