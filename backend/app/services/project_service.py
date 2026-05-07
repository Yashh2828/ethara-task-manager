"""
Project service - handles project creation, member management
Business logic for project operations
"""

from app.models.db import get_db
from app.utils.helpers import serialize_doc, get_current_timestamp, convert_to_object_id
from bson import ObjectId

class ProjectService:
    """Service class for project operations"""
    
    def __init__(self):
        self.db = get_db()
        self.projects_collection = self.db['projects']
        self.tasks_collection = self.db['tasks']
    
    def create_project(self, name, created_by, description=None):
        """
        Create a new project
        Creator automatically becomes admin
        
        Args:
            name: Project name
            created_by: User ID of project creator
            description: Project description (optional)
        
        Returns:
            Tuple (success, project_id, message)
        """
        try:
            if not name or len(name) < 2:
                return False, None, "Project name must be at least 2 characters"
            
            # Create project with creator as admin
            project_doc = {
                'name': name,
                'description': description or '',
                'created_by': convert_to_object_id(created_by),
                'members': [
                    {
                        'user_id': convert_to_object_id(created_by),
                        'role': 'admin'  # Creator is admin by default
                    }
                ],
                'created_at': get_current_timestamp()
            }
            
            result = self.projects_collection.insert_one(project_doc)
            return True, str(result.inserted_id), "Project created successfully"
        
        except Exception as e:
            print(f"Create project error: {str(e)}")
            return False, None, f"Failed to create project: {str(e)}"
    
    def get_projects_by_user(self, user_id):
        """
        Get all projects for a user (where user is a member)
        
        Args:
            user_id: User ID to find projects for
        
        Returns:
            List of project documents
        """
        try:
            user_id_obj = convert_to_object_id(user_id)
            projects = list(self.projects_collection.find(
                {'members.user_id': user_id_obj}
            ))
            for p in projects:
                p['task_count'] = self.tasks_collection.count_documents({'project_id': p['_id']})
            return [serialize_doc(p) for p in projects]
        
        except Exception as e:
            print(f"Get projects error: {str(e)}")
            return []
    
    def get_project_by_id(self, project_id):
        """
        Get project by ID with full details
        
        Args:
            project_id: Project ID
        
        Returns:
            Project document or None
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            project = self.projects_collection.find_one({'_id': project_id_obj})
            if project:
                project['task_count'] = self.tasks_collection.count_documents({'project_id': project_id_obj})
            return serialize_doc(project)
        
        except Exception as e:
            print(f"Get project error: {str(e)}")
            return None
    
    def is_user_admin(self, project_id, user_id):
        """
        Check if user is admin of project
        
        Args:
            project_id: Project ID
            user_id: User ID
        
        Returns:
            Boolean indicating admin status
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            user_id_obj = convert_to_object_id(user_id)
            
            project = self.projects_collection.find_one({
                '_id': project_id_obj,
                'members': {
                    '$elemMatch': {
                        'user_id': user_id_obj,
                        'role': 'admin'
                    }
                }
            })
            
            return project is not None
        
        except Exception as e:
            print(f"Admin check error: {str(e)}")
            return False
    
    def is_user_member(self, project_id, user_id):
        """
        Check if user is member of project
        
        Args:
            project_id: Project ID
            user_id: User ID
        
        Returns:
            Boolean indicating membership
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            user_id_obj = convert_to_object_id(user_id)
            
            project = self.projects_collection.find_one({
                '_id': project_id_obj,
                'members.user_id': user_id_obj
            })
            
            return project is not None
        
        except Exception as e:
            print(f"Membership check error: {str(e)}")
            return False
    
    def add_member(self, project_id, user_id, role='member'):
        """
        Add member to project
        
        Args:
            project_id: Project ID
            user_id: User ID to add
            role: User role (default: 'member')
        
        Returns:
            Tuple (success, message)
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            user_id_obj = convert_to_object_id(user_id)
            
            # Check if already a member
            if self.is_user_member(project_id, user_id):
                return False, "User is already a member"
            
            # Add member
            result = self.projects_collection.update_one(
                {'_id': project_id_obj},
                {
                    '$push': {
                        'members': {
                            'user_id': user_id_obj,
                            'role': role
                        }
                    }
                }
            )
            
            if result.modified_count == 0:
                return False, "Project not found"
            
            return True, "Member added successfully"
        
        except Exception as e:
            print(f"Add member error: {str(e)}")
            return False, f"Failed to add member: {str(e)}"
    
    def remove_member(self, project_id, user_id):
        """
        Remove member from project
        
        Args:
            project_id: Project ID
            user_id: User ID to remove
        
        Returns:
            Tuple (success, message)
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            user_id_obj = convert_to_object_id(user_id)
            
            # Get project to check if user is creator
            project = self.projects_collection.find_one({'_id': project_id_obj})
            
            if not project:
                return False, "Project not found"
            
            # Check if trying to remove project creator
            if project['created_by'] == user_id_obj:
                return False, "Cannot remove project creator"
            
            # Remove member
            result = self.projects_collection.update_one(
                {'_id': project_id_obj},
                {
                    '$pull': {
                        'members': {'user_id': user_id_obj}
                    }
                }
            )
            
            if result.modified_count == 0:
                return False, "Member not found in project"
            
            # Delete associated tasks for this user in this project
            self.tasks_collection.delete_many({
                'project_id': project_id_obj,
                'assigned_to': user_id_obj
            })
            
            return True, "Member removed successfully"
        
        except Exception as e:
            print(f"Remove member error: {str(e)}")
            return False, f"Failed to remove member: {str(e)}"
    
    def update_member_role(self, project_id, user_id, new_role):
        """
        Update member's role in project
        
        Args:
            project_id: Project ID
            user_id: User ID
            new_role: New role ('admin' or 'member')
        
        Returns:
            Tuple (success, message)
        """
        try:
            if new_role not in ['admin', 'member']:
                return False, "Invalid role"
            
            project_id_obj = convert_to_object_id(project_id)
            user_id_obj = convert_to_object_id(user_id)
            
            result = self.projects_collection.update_one(
                {'_id': project_id_obj, 'members.user_id': user_id_obj},
                {
                    '$set': {'members.$.role': new_role}
                }
            )
            
            if result.modified_count == 0:
                return False, "Member not found"
            
            return True, "Member role updated successfully"
        
        except Exception as e:
            print(f"Update role error: {str(e)}")
            return False, f"Failed to update role: {str(e)}"
    
    def get_members_with_details(self, project_id):
        """
        Get project members with user details (name, email, etc.)
        """
        try:
            from app.models.db import get_db
            db = get_db()
            users_collection = db['users']
            
            project_id_obj = convert_to_object_id(project_id)
            project = self.projects_collection.find_one({'_id': project_id_obj})
            if not project:
                return []
            
            members = project.get('members', [])
            result = []
            
            for member in members:
                user = users_collection.find_one({'_id': member['user_id']}, {'password': 0})
                if user:
                    member_detail = serialize_doc(user)
                    member_detail['role'] = member.get('role')
                    result.append(member_detail)
                    
            return result
            
        except Exception as e:
            print(f"Get members with details error: {str(e)}")
            return []

    def get_available_users(self, project_id):
        """
        Get list of users who can be added to project (not already members)
        
        Args:
            project_id: Project ID
        
        Returns:
            List of user documents
        """
        try:
            from app.models.db import get_db
            db = get_db()
            users_collection = db['users']
            
            project_id_obj = convert_to_object_id(project_id)
            
            # Get project to find existing member IDs
            project = self.projects_collection.find_one({'_id': project_id_obj})
            if not project:
                return []
            
            # Get existing member user IDs
            existing_member_ids = [member['user_id'] for member in project.get('members', [])]
            
            # Find users who are not already members
            available_users = list(users_collection.find({
                '_id': {'$nin': existing_member_ids}
            }, {'password': 0}))  # Exclude password field
            
            return [serialize_doc(u) for u in available_users]
        
        except Exception as e:
            print(f"Get available users error: {str(e)}")
            return []

    def delete_project(self, project_id, user_id):
        """
        Delete a project and its associated tasks
        
        Args:
            project_id: Project ID
            user_id: User ID of the admin requesting deletion
            
        Returns:
            Tuple (success, message)
        """
        try:
            # Check if user is admin
            if not self.is_user_admin(project_id, user_id):
                return False, "Only project admin can delete the project"
            
            project_id_obj = convert_to_object_id(project_id)
            
            # Delete associated tasks first
            self.tasks_collection.delete_many({'project_id': project_id_obj})
            
            # Delete project
            result = self.projects_collection.delete_one({'_id': project_id_obj})
            
            if result.deleted_count == 0:
                return False, "Project not found"
                
            return True, "Project deleted successfully"
            
        except Exception as e:
            print(f"Delete project error: {str(e)}")
            return False, f"Failed to delete project: {str(e)}"
