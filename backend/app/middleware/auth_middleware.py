"""
Authentication middleware for JWT token validation
Protects routes and verifies user identity
"""

from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps
from app.utils.helpers import error_response

def token_required(f):
    """
    Decorator to require valid JWT token
    Usage: @app.route('/protected') @token_required def protected():
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        verify_jwt_in_request()
        return f(*args, **kwargs)
    return decorated


def optional_token(f):
    """
    Decorator for optional JWT token
    If token provided, validates it. If not, continues anyway.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request(optional=True)
        except:
            pass  # Continue even if no token
        return f(*args, **kwargs)
    return decorated
