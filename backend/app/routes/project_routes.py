"""
Project routes
Handles project management endpoints
"""

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from app.services.project_service import ProjectService
from app.utils.helpers import success_response, error_response, validate_required_fields
from app.middleware.auth_middleware import token_required

# Create Blueprint
project_bp = Blueprint('projects', __name__)
project_service = ProjectService()


@project_bp.route('', methods=['POST'])
@token_required
def create_project():
    """
    Create a new project
    POST /projects
    Requires: JWT token
    
    Request body:
    {
        "name": "Project Name"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        is_valid, missing_fields = validate_required_fields(data, ['name'])
        if not is_valid:
            return error_response(f"Missing fields: {', '.join(missing_fields)}", 400)
        
        # Get optional description
        description = data.get('description', '')
        
        # Create project
        success, project_id, message = project_service.create_project(data['name'], user_id, description)
        
        if success:
            project = project_service.get_project_by_id(project_id)
            return success_response({'project': project}, message, 201)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Create project error: {str(e)}")
        return error_response(f"Failed to create project: {str(e)}", 500)


@project_bp.route('', methods=['GET'])
@token_required
def get_projects():
    """
    Get all projects for current user
    GET /projects
    Requires: JWT token
    """
    try:
        user_id = get_jwt_identity()
        
        # Get projects
        projects = project_service.get_projects_by_user(user_id)
        
        return success_response(projects, "Projects retrieved", 200)
    
    except Exception as e:
        print(f"Get projects error: {str(e)}")
        return error_response(f"Failed to get projects: {str(e)}", 500)


@project_bp.route('/<project_id>', methods=['GET'])
@token_required
def get_project(project_id):
    """
    Get single project by ID
    GET /projects/<project_id>
    Requires: JWT token
    """
    try:
        user_id = get_jwt_identity()
        
        # Get project
        project = project_service.get_project_by_id(project_id)
        
        if not project:
            return error_response("Project not found", 404)
        
        # Check if user is member
        if not project_service.is_user_member(project_id, user_id):
            return error_response("You don't have access to this project", 403)
        
        return success_response(project, "Project retrieved", 200)
    
    except Exception as e:
        print(f"Get project error: {str(e)}")
        return error_response(f"Failed to get project: {str(e)}", 500)


@project_bp.route('/<project_id>/available-users', methods=['GET'])
@token_required
def get_available_users(project_id):
    """
    Get users who can be added to project (not already members)
    GET /projects/<project_id>/available-users
    Requires: JWT token (admin of project)
    """
    try:
        user_id = get_jwt_identity()
        
        # Check if current user is admin
        if not project_service.is_user_admin(project_id, user_id):
            return error_response("Only project admin can view available users", 403)
        
        # Get available users
        users = project_service.get_available_users(project_id)
        
        return success_response(users, "Available users retrieved", 200)
    
    except Exception as e:
        print(f"Get available users error: {str(e)}")
        return error_response(f"Failed to get available users: {str(e)}", 500)


@project_bp.route('/<project_id>/add-member', methods=['POST'])
@token_required
def add_member(project_id):
    """
    Add member to project (admin only)
    POST /projects/<project_id>/add-member
    Requires: JWT token (admin of project)
    
    Request body:
    {
        "user_id": "<user_id>",
        "role": "member"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        is_valid, missing_fields = validate_required_fields(data, ['user_id'])
        if not is_valid:
            return error_response(f"Missing fields: {', '.join(missing_fields)}", 400)
        
        # Check if current user is admin
        if not project_service.is_user_admin(project_id, user_id):
            return error_response("Only project admin can add members", 403)
        
        # Add member
        role = data.get('role', 'member')
        success, message = project_service.add_member(project_id, data['user_id'], role)
        
        if success:
            return success_response({}, message, 201)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Add member error: {str(e)}")
        return error_response(f"Failed to add member: {str(e)}", 500)


@project_bp.route('/<project_id>/remove-member', methods=['DELETE'])
@token_required
def remove_member(project_id):
    """
    Remove member from project (admin only)
    DELETE /projects/<project_id>/remove-member
    Requires: JWT token (admin of project)
    
    Request body:
    {
        "user_id": "<user_id>"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        is_valid, missing_fields = validate_required_fields(data, ['user_id'])
        if not is_valid:
            return error_response(f"Missing fields: {', '.join(missing_fields)}", 400)
        
        # Check if current user is admin
        if not project_service.is_user_admin(project_id, user_id):
            return error_response("Only project admin can remove members", 403)
        
        # Remove member
        success, message = project_service.remove_member(project_id, data['user_id'])
        
        if success:
            return success_response({}, message, 200)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Remove member error: {str(e)}")
        return error_response(f"Failed to remove member: {str(e)}", 500)


@project_bp.route('/<project_id>/members', methods=['GET'])
@token_required
def get_members(project_id):
    """
    Get all members of a project
    GET /projects/<project_id>/members
    Requires: JWT token (member of project)
    """
    try:
        user_id = get_jwt_identity()
        
        # Check if user is member
        if not project_service.is_user_member(project_id, user_id):
            return error_response("You don't have access to this project", 403)
        
        # Get members with details
        members = project_service.get_members_with_details(project_id)
        
        return success_response(members, "Members retrieved", 200)
    
    except Exception as e:
        print(f"Get members error: {str(e)}")
        return error_response(f"Failed to get members: {str(e)}", 500)


@project_bp.route('/<project_id>', methods=['DELETE'])
@token_required
def delete_project(project_id):
    """
    Delete a project
    DELETE /projects/<project_id>
    Requires: JWT token (admin of project)
    """
    try:
        user_id = get_jwt_identity()
        
        success, message = project_service.delete_project(project_id, user_id)
        
        if success:
            return success_response({}, message, 200)
        else:
            return error_response(message, 403 if "admin" in message else 400)
            
    except Exception as e:
        print(f"Delete project error: {str(e)}")
        return error_response(f"Failed to delete project: {str(e)}", 500)
