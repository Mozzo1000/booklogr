from flask import jsonify, request, current_app
from functools import wraps
from flask_jwt_extended import jwt_required

def required_params(*args):
    """Decorator factory to check request data for POST requests and return
    an error if required parameters are missing."""
    required = list(args)
 
    def decorator(fn):
        """Decorator that checks for the required parameters"""
 
        @wraps(fn)
        def wrapper(*args, **kwargs):
            missing = [r for r in required if r not in request.get_json()]
            if missing:
                response = {
                    "status": "error",
                    "message": "Request JSON is missing some required params",
                    "missing": missing
                }
                return jsonify(response), 400
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def auth_required():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if current_app.config.get("SINGLE_USER_MODE").lower() in ["true", "y"]:
                return f(*args, **kwargs)
            return jwt_required()(f)(*args, **kwargs)
        return decorated_function
    return decorator