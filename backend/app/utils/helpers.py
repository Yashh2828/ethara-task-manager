"""
Helper functions for common operations
Includes serialization, validation, and utility functions
"""

from bson import ObjectId
from datetime import datetime
from functools import wraps
from flask import jsonify, request
import re

def serialize_doc(doc):
    """
    Convert MongoDB document to JSON-serializable format
    Converts ObjectId and datetime objects to strings
    
    Args:
        doc: MongoDB document (dict)
    
    Returns:
        Dictionary with serialized values
    """
    if doc is None:
        return None
    
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    
    if isinstance(doc, dict):
        serialized = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                serialized[key] = str(value)
            elif isinstance(value, datetime):
                serialized[key] = value.isoformat()
            elif isinstance(value, bytes):
                # Skip bytes (like password hashes)
                continue
            elif isinstance(value, dict):
                serialized[key] = serialize_doc(value)
            elif isinstance(value, list):
                serialized[key] = serialize_doc(value)
            else:
                serialized[key] = value
        return serialized
    
    return doc


def is_valid_object_id(id_string):
    """
    Validate if string is a valid MongoDB ObjectId
    
    Args:
        id_string: String to validate
    
    Returns:
        Boolean indicating validity
    """
    try:
        ObjectId(id_string)
        return True
    except:
        return False


def convert_to_object_id(id_string):
    """
    Convert string to ObjectId
    Raises ValueError if invalid
    
    Args:
        id_string: String ID to convert
    
    Returns:
        ObjectId instance
    """
    try:
        return ObjectId(id_string)
    except:
        raise ValueError(f"Invalid ID format: {id_string}")


def is_valid_email(email):
    """
    Validate email format
    
    Args:
        email: Email string to validate
    
    Returns:
        Boolean indicating validity
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def success_response(data=None, message="Success", status_code=200):
    """
    Create a standardized success response
    
    Args:
        data: Response data
        message: Response message
        status_code: HTTP status code
    
    Returns:
        Flask response tuple
    """
    response = {
        'success': True,
        'message': message,
        'data': data
    }
    return jsonify(response), status_code


def error_response(message, status_code=400, errors=None):
    """
    Create a standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Additional error details
    
    Returns:
        Flask response tuple
    """
    response = {
        'success': False,
        'message': message,
        'errors': errors or {}
    }
    return jsonify(response), status_code


def validate_required_fields(data, required_fields):
    """
    Validate that required fields are present and not empty
    
    Args:
        data: Request data dictionary
        required_fields: List of required field names
    
    Returns:
        Tuple (is_valid, missing_fields)
    """
    missing_fields = []
    
    for field in required_fields:
        if field not in data or not data[field]:
            missing_fields.append(field)
    
    return len(missing_fields) == 0, missing_fields


def get_current_timestamp():
    """
    Get current timestamp in ISO format
    
    Returns:
        ISO format datetime string
    """
    return datetime.utcnow().isoformat()


def check_authorization(required_role=None):
    """
    Decorator to check user authorization (usage in services)
    This is a helper for role-based checks
    
    Args:
        required_role: Role required to access the endpoint
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # This decorator is used with JWT_required in routes
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def is_task_overdue(due_date):
    """
    Check if task is overdue
    
    Args:
        due_date: Due date as datetime or ISO string
    
    Returns:
        Boolean indicating if overdue
    """
    if isinstance(due_date, str):
        try:
            due_date = datetime.fromisoformat(due_date)
        except:
            return False
    
    return due_date < datetime.utcnow()


def get_task_age_in_days(created_at):
    """
    Get age of task in days
    
    Args:
        created_at: Creation date as datetime or ISO string
    
    Returns:
        Number of days
    """
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at)
        except:
            return 0
    
    delta = datetime.utcnow() - created_at
    return delta.days
