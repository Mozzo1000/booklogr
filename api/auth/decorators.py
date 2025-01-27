from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import jsonify
from functools import wraps

def require_role(role):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims["role"] == role:
                return fn(*args, **kwargs)
            else:
                return jsonify({'error': 'Permission denied', 'message': 'You do not have the required permission.'}), 403
        return decorator
    return wrapper

def disable_route(value=False):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            print(value)
            if value.lower() in ["true", "yes", "y"]:
                return fn(*args, **kwargs)
            else:
                return jsonify({'error': 'Route disabled', 'message': 'This route has been disabled by the administrator.'}), 403
        return decorator
    return wrapper