"""
Dashboard routes
Handles dashboard and analytics endpoints
"""

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from app.services.dashboard_service import DashboardService
from app.services.project_service import ProjectService
from app.services.task_service import TaskService
from app.utils.helpers import success_response, error_response
from app.middleware.auth_middleware import token_required

# Create Blueprint
dashboard_bp = Blueprint('dashboard', __name__)
dashboard_service = DashboardService()
project_service = ProjectService()
task_service = TaskService()


@dashboard_bp.route('', methods=['GET'])
@token_required
def get_dashboard():
    """
    Get user's personal dashboard
    GET /dashboard
    Requires: JWT token
    
    Returns: All tasks assigned to user across all projects
    """
    try:
        user_id = get_jwt_identity()
        
        # Get user's dashboard
        dashboard = dashboard_service.get_user_dashboard(user_id)
        
        return success_response(dashboard, "Dashboard retrieved", 200)
    
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return error_response(f"Failed to get dashboard: {str(e)}", 500)


@dashboard_bp.route('/project/<project_id>', methods=['GET'])
@token_required
def get_project_dashboard(project_id):
    """
    Get project dashboard with statistics
    GET /dashboard/project/<project_id>
    Requires: JWT token (user must be project member)
    """
    try:
        user_id = get_jwt_identity()
        
        # Check if user is member of project
        if not project_service.is_user_member(project_id, user_id):
            return error_response("You're not a member of this project", 403)
        
        # Get dashboard stats
        stats = dashboard_service.get_dashboard_stats(project_id)
        
        return success_response(stats, "Project dashboard retrieved", 200)
    
    except Exception as e:
        print(f"Project dashboard error: {str(e)}")
        return error_response(f"Failed to get dashboard: {str(e)}", 500)


@dashboard_bp.route('/project/<project_id>/members', methods=['GET'])
@token_required
def get_project_members_stats(project_id):
    """
    Get statistics for each team member in project
    GET /dashboard/project/<project_id>/members
    Requires: JWT token (user must be project member)
    """
    try:
        user_id = get_jwt_identity()
        
        # Check if user is member of project
        if not project_service.is_user_member(project_id, user_id):
            return error_response("You're not a member of this project", 403)
        
        # Get members stats
        members_stats = dashboard_service.get_project_members_stats(project_id)
        
        return success_response(members_stats, "Members stats retrieved", 200)
    
    except Exception as e:
        print(f"Members stats error: {str(e)}")
        return error_response(f"Failed to get members stats: {str(e)}", 500)


@dashboard_bp.route('/user/<user_id>', methods=['GET'])
@token_required
def get_user_tasks(user_id):
    """
    Get all tasks assigned to a specific user
    GET /dashboard/user/<user_id>?project_id=<project_id>
    Requires: JWT token
    
    Query params:
    - project_id: Optional, filter tasks by project
    """
    try:
        current_user_id = get_jwt_identity()
        project_id = request.args.get('project_id', None)
        
        # If project_id provided, check membership
        if project_id:
            if not project_service.is_user_member(project_id, current_user_id):
                return error_response("You're not a member of this project", 403)
        
        # Get user's tasks
        tasks = task_service.get_tasks_by_user(user_id, project_id)
        
        return success_response(tasks, "User tasks retrieved", 200)
    
    except Exception as e:
        print(f"User tasks error: {str(e)}")
        return error_response(f"Failed to get user tasks: {str(e)}", 500)
