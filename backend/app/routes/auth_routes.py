"""
Authentication routes
Handles user signup and login
"""

from flask import Blueprint, request
from flask_jwt_extended import create_access_token
from app.services.auth_service import AuthService
from app.utils.helpers import success_response, error_response, validate_required_fields, serialize_doc
from app.middleware.auth_middleware import token_required

# Create Blueprint
auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    User signup endpoint
    POST /auth/signup
    
    Request body:
    {
        "name": "John Doe",
        "email": "john@example.com",
        "password": "secure123",
        "role": "admin" or "member"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        is_valid, missing_fields = validate_required_fields(data, ['name', 'email', 'password'])
        if not is_valid:
            return error_response(f"Missing fields: {', '.join(missing_fields)}", 400)
        
        # Get role from request, default to 'member'
        role = data.get('role', 'member')
        if role not in ['admin', 'member']:
            role = 'member'
        
        # Get optional fields
        employee_id = data.get('employee_id')
        designation = data.get('designation')
        
        # Call signup service
        success, user_id, message, user_data = auth_service.signup(
            data['name'],
            data['email'],
            data['password'],
            role,
            employee_id,
            designation
        )
        
        if success:
            # Create JWT token
            access_token = create_access_token(
                identity=user_id,
                additional_claims={'email': data['email'], 'role': role}
            )
            
            response_data = {
                'user': user_data,
                'access_token': access_token
            }
            
            return success_response(response_data, message, 201)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return error_response(f"Signup failed: {str(e)}", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    POST /auth/login
    
    Request body:
    {
        "email": "john@example.com",
        "password": "secure123"
    }
    
    Response includes JWT access token
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        is_valid, missing_fields = validate_required_fields(data, ['email', 'password'])
        if not is_valid:
            return error_response(f"Missing fields: {', '.join(missing_fields)}", 400)
        
        # Call login service
        success, user_data, message = auth_service.login(data['email'], data['password'])
        
        if success:
            # Create JWT token
            # The identity is the user ID and include email and role
            access_token = create_access_token(
                identity=str(user_data['_id']),
                additional_claims={'email': user_data['email'], 'role': user_data.get('role', 'member')}
            )
            
            response_data = {
                'user': user_data,
                'access_token': access_token
            }
            
            return success_response(response_data, message, 200)
        else:
            return error_response(message, 401)
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return error_response(f"Login failed: {str(e)}", 500)


@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    """
    Get current user profile
    GET /auth/profile
    Requires: JWT token
    """
    try:
        from flask_jwt_extended import get_jwt_identity
        user_id = get_jwt_identity()
        
        user = auth_service.get_user_by_id(user_id)
        
        if user:
            return success_response(user, "Profile retrieved", 200)
        else:
            return error_response("User not found", 404)
    
    except Exception as e:
        print(f"Get profile error: {str(e)}")
        return error_response(f"Failed to get profile: {str(e)}", 500)
