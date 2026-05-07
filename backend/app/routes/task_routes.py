"""
Task routes
Handles task management endpoints
"""

from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity
from app.services.task_service import TaskService
from app.services.project_service import ProjectService
from app.utils.helpers import success_response, error_response, validate_required_fields, convert_to_object_id
from app.middleware.auth_middleware import token_required

# Create Blueprint
task_bp = Blueprint('tasks', __name__)
task_service = TaskService()
project_service = ProjectService()


@task_bp.route('', methods=['POST'])
@token_required
def create_task():
    """
    Create a new task
    POST /tasks
    Requires: JWT token (user must be project member)
    
    Request body:
    {
        "project_id": "<project_id>",
        "title": "Task title",
        "description": "Task description",
        "assigned_to": "<user_id>",
        "priority": "high",
        "status": "todo",
        "due_date": "2024-12-31"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        is_valid, missing_fields = validate_required_fields(
            data, ['project_id', 'title']
        )
        if not is_valid:
            return error_response(f"Missing fields: {', '.join(missing_fields)}", 400)
        
        # Check if user is member of project
        if not project_service.is_user_member(data['project_id'], user_id):
            return error_response("You're not a member of this project", 403)
        
        # Get optional fields
        assigned_to = data.get('assigned_to')
        description = data.get('description', '')
        status = data.get('status', 'assigned')
        priority = data.get('priority', 'medium')
        due_date = data.get('due_date', None)
        
        # Create task
        success, task_id, message = task_service.create_task(
            data['project_id'],
            data['title'],
            description,
            assigned_to,
            status,
            priority,
            due_date
        )
        
        if success:
            task = task_service.get_task_by_id(task_id)
            return success_response({'task': task}, message, 201)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Create task error: {str(e)}")
        return error_response(f"Failed to create task: {str(e)}", 500)


@task_bp.route('', methods=['GET'])
@token_required
def get_all_tasks():
    """
    Get tasks for the current user
    - Admins: Get all tasks from projects they admin
    - Members: Get only tasks assigned to them from projects they are part of
    GET /tasks?project_id=<optional>
    Requires: JWT token
    """
    try:
        from app.services.auth_service import AuthService
        user_id = get_jwt_identity()
        project_id = request.args.get('project_id')
        
        # Check if user is admin (global admin role)
        auth_service = AuthService()
        user = auth_service.users_collection.find_one({'_id': convert_to_object_id(user_id)})
        is_global_admin = user and user.get('role') == 'admin'
        
        if project_id:
            # If project_id provided, verify membership
            if not project_service.is_user_member(project_id, user_id):
                return error_response("You're not a member of this project", 403)
            
            # Check if user is admin of this specific project
            is_project_admin = project_service.is_user_admin(project_id, user_id)
            
            if is_global_admin or is_project_admin:
                # Admins see all tasks in the project
                tasks = task_service.get_tasks_by_project(project_id)
            else:
                # Members see only their assigned tasks in this project
                tasks = task_service.get_tasks_by_user(user_id, project_id)
        else:
            # Get all projects the user is a member of
            user_projects = project_service.get_projects_by_user(user_id)
            
            if is_global_admin:
                # Global admins see all tasks from all projects they are part of
                project_ids = [convert_to_object_id(p['_id']) for p in user_projects if '_id' in p]
                if project_ids:
                    tasks = task_service._aggregate_tasks({'project_id': {'$in': project_ids}})
                else:
                    tasks = []
            else:
                # Members see only their assigned tasks across all projects
                tasks = task_service.get_tasks_by_user(user_id)
                # Filter to only include tasks from projects they are members of
                project_ids = {str(p['_id']) for p in user_projects if '_id' in p}
                tasks = [t for t in tasks if str(t.get('project_id')) in project_ids]
        
        return success_response(tasks, "Tasks retrieved", 200)
        
    except Exception as e:
        print(f"Get all tasks error: {str(e)}")
        return error_response(f"Failed to get tasks: {str(e)}", 500)


@task_bp.route('/project/<project_id>', methods=['GET'])
@token_required
def get_tasks_by_project(project_id):
    """
    Get tasks in a project
    - Admins: Get all tasks
    - Members: Get only tasks assigned to them
    GET /tasks/project/<project_id>
    Requires: JWT token (user must be project member)
    """
    try:
        from app.services.auth_service import AuthService
        user_id = get_jwt_identity()
        
        # Check if user is member of project
        if not project_service.is_user_member(project_id, user_id):
            return error_response("You're not a member of this project", 403)
        
        # Check if user is admin (global or project)
        auth_service = AuthService()
        user = auth_service.users_collection.find_one({'_id': convert_to_object_id(user_id)})
        is_global_admin = user and user.get('role') == 'admin'
        is_project_admin = project_service.is_user_admin(project_id, user_id)
        
        if is_global_admin or is_project_admin:
            # Admins see all tasks
            tasks = task_service.get_tasks_by_project(project_id)
        else:
            # Members see only their assigned tasks
            tasks = task_service.get_tasks_by_user(user_id, project_id)
        
        return success_response(tasks, "Tasks retrieved", 200)
    
    except Exception as e:
        print(f"Get tasks error: {str(e)}")
        return error_response(f"Failed to get tasks: {str(e)}", 500)


@task_bp.route('/<task_id>', methods=['GET'])
@token_required
def get_task(task_id):
    """
    Get single task by ID
    GET /tasks/<task_id>
    Requires: JWT token
    """
    try:
        user_id = get_jwt_identity()
        
        # Get task
        task = task_service.get_task_by_id(task_id)
        
        if not task:
            return error_response("Task not found", 404)
        
        # Check if user is member of the project
        if not project_service.is_user_member(str(task['project_id']), user_id):
            return error_response("You don't have access to this task", 403)
        
        return success_response(task, "Task retrieved", 200)
    
    except Exception as e:
        print(f"Get task error: {str(e)}")
        return error_response(f"Failed to get task: {str(e)}", 500)


@task_bp.route('/<task_id>', methods=['PUT'])
@token_required
def update_task(task_id):
    """
    Update task details
    PUT /tasks/<task_id>
    Requires: JWT token (admin or task assignee)
    
    Request body (any of):
    {
        "title": "New title",
        "description": "New description",
        "priority": "high",
        "assigned_to": "<user_id>",
        "due_date": "2024-12-31"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get task
        task = task_service.get_task_by_id(task_id)
        if not task:
            return error_response("Task not found", 404)
        
        # Check permissions
        project_id = str(task['project_id'])
        is_admin = project_service.is_user_admin(project_id, user_id)
        
        if not task_service.can_user_update_task(task_id, user_id, is_admin):
            return error_response("You don't have permission to update this task", 403)
        
        # Update task
        success, message = task_service.update_task(task_id, **data)
        
        if success:
            return success_response({}, message, 200)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Update task error: {str(e)}")
        return error_response(f"Failed to update task: {str(e)}", 500)


@task_bp.route('/<task_id>/status', methods=['PATCH'])
@token_required
def update_task_status(task_id):
    """
    Update task status
    PATCH /tasks/<task_id>/status
    Requires: JWT token (admin or task assignee)
    
    Request body:
    {
        "status": "in_progress"
    }
    """
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        is_valid, missing_fields = validate_required_fields(data, ['status'])
        if not is_valid:
            return error_response(f"Missing fields: {', '.join(missing_fields)}", 400)
        
        # Get task
        task = task_service.get_task_by_id(task_id)
        if not task:
            return error_response("Task not found", 404)
        
        # Check permissions
        project_id = str(task['project_id'])
        is_admin = project_service.is_user_admin(project_id, user_id)
        
        if not task_service.can_user_update_task(task_id, user_id, is_admin):
            return error_response("You don't have permission to update this task", 403)
        
        # Update status
        success, message = task_service.update_task_status(task_id, data['status'])
        
        if success:
            return success_response({}, message, 200)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Update status error: {str(e)}")
        return error_response(f"Failed to update status: {str(e)}", 500)


@task_bp.route('/<task_id>', methods=['DELETE'])
@token_required
def delete_task(task_id):
    """
    Delete a task
    DELETE /tasks/<task_id>
    Requires: JWT token (project admin only)
    """
    try:
        user_id = get_jwt_identity()
        
        # Get task
        task = task_service.get_task_by_id(task_id)
        if not task:
            return error_response("Task not found", 404)
        
        # Check if user is admin of project
        project_id = str(task['project_id'])
        if not project_service.is_user_admin(project_id, user_id):
            return error_response("Only project admin can delete tasks", 403)
        
        # Delete task
        success, message = task_service.delete_task(task_id)
        
        if success:
            return success_response({}, message, 200)
        else:
            return error_response(message, 400)
    
    except Exception as e:
        print(f"Delete task error: {str(e)}")
        return error_response(f"Failed to delete task: {str(e)}", 500)
