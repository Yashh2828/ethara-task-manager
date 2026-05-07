"""
Task service - handles task creation, assignment, and status updates
Business logic for task operations
"""

from app.models.db import get_db
from app.utils.helpers import serialize_doc, get_current_timestamp, convert_to_object_id
from bson import ObjectId
from datetime import datetime

class TaskService:
    """Service class for task operations"""
    
    def __init__(self):
        self.db = get_db()
        self.tasks_collection = self.db['tasks']
        self.projects_collection = self.db['projects']
    
    # Valid status and priority values
    VALID_STATUSES = ['assigned', 'todo', 'in_progress', 'review', 'done']
    VALID_PRIORITIES = ['low', 'medium', 'high']
    
    def create_task(self, project_id, title, description, assigned_to=None, status='assigned', priority='medium', due_date=None):
        """
        Create a new task
        
        Args:
            project_id: Project ID
            title: Task title
            description: Task description
            assigned_to: User ID to assign task to (optional)
            status: Task status (default: 'todo')
            priority: Task priority (default: 'medium')
            due_date: Due date (ISO format string)
        
        Returns:
            Tuple (success, task_id, message)
        """
        try:
            # Validate inputs
            if not title or len(title) < 2:
                return False, None, "Title must be at least 2 characters"
            
            if status not in self.VALID_STATUSES:
                return False, None, f"Invalid status. Must be one of: {', '.join(self.VALID_STATUSES)}"
            
            if priority not in self.VALID_PRIORITIES:
                return False, None, f"Invalid priority. Must be one of: {', '.join(self.VALID_PRIORITIES)}"
            
            # Convert IDs
            project_id_obj = convert_to_object_id(project_id)
            assigned_to_obj = convert_to_object_id(assigned_to) if assigned_to else None
            
            # Create task document
            task_doc = {
                'project_id': project_id_obj,
                'title': title,
                'description': description or '',
                'assigned_to': assigned_to_obj,
                'status': status,
                'priority': priority,
                'due_date': due_date,
                'created_at': get_current_timestamp()
            }
            
            result = self.tasks_collection.insert_one(task_doc)
            return True, str(result.inserted_id), "Task created successfully"
        
        except Exception as e:
            print(f"Create task error: {str(e)}")
            return False, None, f"Failed to create task: {str(e)}"
    
    def _aggregate_tasks(self, match_query):
        """
        Helper to run an aggregation pipeline to get fully populated tasks
        """
        pipeline = [
            {'$match': match_query},
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'assigned_to',
                    'foreignField': '_id',
                    'as': 'assignee'
                }
            },
            {
                '$unwind': {
                    'path': '$assignee',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project_id',
                    'foreignField': '_id',
                    'as': 'project'
                }
            },
            {
                '$unwind': {
                    'path': '$project',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$project': {
                    'assignee.password': 0
                }
            }
        ]
        tasks = list(self.tasks_collection.aggregate(pipeline))
        return [serialize_doc(t) for t in tasks]

    def get_tasks_by_project(self, project_id):
        """
        Get all tasks in a project
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            return self._aggregate_tasks({'project_id': project_id_obj})
        
        except Exception as e:
            print(f"Get tasks error: {str(e)}")
            return []
    
    def get_task_by_id(self, task_id):
        """
        Get task by ID
        """
        try:
            task_id_obj = convert_to_object_id(task_id)
            tasks = self._aggregate_tasks({'_id': task_id_obj})
            return tasks[0] if tasks else None
        
        except Exception as e:
            print(f"Get task error: {str(e)}")
            return None
    
    def get_tasks_by_user(self, user_id, project_id=None):
        """
        Get all tasks assigned to a user
        """
        try:
            user_id_obj = convert_to_object_id(user_id)
            query = {'assigned_to': user_id_obj}
            
            if project_id:
                query['project_id'] = convert_to_object_id(project_id)
            
            return self._aggregate_tasks(query)
        
        except Exception as e:
            print(f"Get user tasks error: {str(e)}")
            return []
    
    def update_task(self, task_id, **kwargs):
        """
        Update task fields
        
        Args:
            task_id: Task ID
            **kwargs: Fields to update (title, description, priority, etc.)
        
        Returns:
            Tuple (success, message)
        """
        try:
            task_id_obj = convert_to_object_id(task_id)
            
            # Allowed fields to update
            allowed_fields = ['title', 'description', 'priority', 'due_date', 'assigned_to']
            
            # Filter and validate
            update_data = {}
            for key, value in kwargs.items():
                if key not in allowed_fields:
                    continue
                
                if key == 'priority' and value not in self.VALID_PRIORITIES:
                    return False, f"Invalid priority. Must be one of: {', '.join(self.VALID_PRIORITIES)}"
                
                if key == 'assigned_to':
                    update_data[key] = convert_to_object_id(value)
                else:
                    update_data[key] = value
            
            if not update_data:
                return True, "No fields to update"
            
            result = self.tasks_collection.update_one(
                {'_id': task_id_obj},
                {'$set': update_data}
            )
            
            if result.matched_count == 0:
                return False, "Task not found"
            
            return True, "Task updated successfully"
        
        except Exception as e:
            print(f"Update task error: {str(e)}")
            return False, f"Failed to update task: {str(e)}"
    
    def update_task_status(self, task_id, new_status):
        """
        Update task status
        
        Args:
            task_id: Task ID
            new_status: New status
        
        Returns:
            Tuple (success, message)
        """
        try:
            if new_status not in self.VALID_STATUSES:
                return False, f"Invalid status. Must be one of: {', '.join(self.VALID_STATUSES)}"
            
            task_id_obj = convert_to_object_id(task_id)
            
            result = self.tasks_collection.update_one(
                {'_id': task_id_obj},
                {'$set': {'status': new_status}}
            )
            
            if result.matched_count == 0:
                return False, "Task not found"
            
            return True, "Task status updated successfully"
        
        except Exception as e:
            print(f"Update status error: {str(e)}")
            return False, f"Failed to update status: {str(e)}"
    
    def can_user_update_task(self, task_id, user_id, is_admin=False):
        """
        Check if user can update task
        Admin can update any task, member can only update assigned tasks
        
        Args:
            task_id: Task ID
            user_id: User ID
            is_admin: Is user admin of project
        
        Returns:
            Boolean indicating permission
        """
        try:
            if is_admin:
                return True
            
            # Member can only update if assigned to them
            task = self.get_task_by_id(task_id)
            if not task:
                return False
            
            return str(task['assigned_to']) == user_id
        
        except Exception as e:
            print(f"Permission check error: {str(e)}")
            return False
    
    def delete_task(self, task_id):
        """
        Delete a task
        
        Args:
            task_id: Task ID
        
        Returns:
            Tuple (success, message)
        """
        try:
            task_id_obj = convert_to_object_id(task_id)
            result = self.tasks_collection.delete_one({'_id': task_id_obj})
            
            if result.deleted_count == 0:
                return False, "Task not found"
            
            return True, "Task deleted successfully"
        
        except Exception as e:
            print(f"Delete task error: {str(e)}")
            return False, f"Failed to delete task: {str(e)}"
