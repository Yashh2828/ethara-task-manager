"""
Dashboard service - handles dashboard statistics and analytics
Business logic for dashboard endpoints
"""

from app.models.db import get_db
from app.utils.helpers import serialize_doc, convert_to_object_id, is_task_overdue
from bson import ObjectId
from datetime import datetime

class DashboardService:
    """Service class for dashboard operations"""
    
    def __init__(self):
        self.db = get_db()
        self.tasks_collection = self.db['tasks']
        self.projects_collection = self.db['projects']
        self.users_collection = self.db['users']
    
    def get_dashboard_stats(self, project_id, user_id=None):
        """
        Get dashboard statistics for a project
        
        Args:
            project_id: Project ID
            user_id: Optional user filter
        
        Returns:
            Dictionary with dashboard statistics
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            
            # Base query
            query = {'project_id': project_id_obj}
            if user_id:
                query['assigned_to'] = convert_to_object_id(user_id)
            
            # Get all tasks
            tasks = list(self.tasks_collection.find(query))
            
            # Calculate statistics
            stats = {
                'total_tasks': len(tasks),
                'tasks_by_status': self._count_by_status(tasks),
                'tasks_by_priority': self._count_by_priority(tasks),
                'overdue_tasks': self._count_overdue_tasks(tasks),
                'tasks_by_user': self._count_by_user(tasks),
                'completion_percentage': self._calculate_completion(tasks)
            }
            
            return stats
        
        except Exception as e:
            print(f"Dashboard stats error: {str(e)}")
            return {}
    
    def _count_by_status(self, tasks):
        """Count tasks by status"""
        counts = {'todo': 0, 'in_progress': 0, 'done': 0}
        for task in tasks:
            status = task.get('status', 'todo')
            if status in counts:
                counts[status] += 1
        return counts
    
    def _count_by_priority(self, tasks):
        """Count tasks by priority"""
        counts = {'low': 0, 'medium': 0, 'high': 0}
        for task in tasks:
            priority = task.get('priority', 'medium')
            if priority in counts:
                counts[priority] += 1
        return counts
    
    def _count_overdue_tasks(self, tasks):
        """Count overdue tasks"""
        overdue_count = 0
        for task in tasks:
            if task.get('due_date') and task.get('status') != 'done':
                if is_task_overdue(task['due_date']):
                    overdue_count += 1
        return overdue_count
    
    def _count_by_user(self, tasks):
        """Count tasks assigned per user"""
        user_counts = {}
        for task in tasks:
            user_id = str(task.get('assigned_to', ''))
            if user_id:
                user_counts[user_id] = user_counts.get(user_id, 0) + 1
        return user_counts
    
    def _calculate_completion(self, tasks):
        """Calculate completion percentage"""
        if not tasks:
            return 0
        
        completed = sum(1 for task in tasks if task.get('status') == 'done')
        return round((completed / len(tasks)) * 100, 2)
    
    def get_user_dashboard(self, user_id):
        """
        Get user's personal dashboard
        Shows all tasks assigned to user across all projects
        
        Args:
            user_id: User ID
        
        Returns:
            Dictionary with user dashboard data
        """
        try:
            user_id_obj = convert_to_object_id(user_id)
            
            # Get all tasks assigned to user
            tasks = list(self.tasks_collection.find({'assigned_to': user_id_obj}))
            
            # Get project details for each task
            project_ids = set()
            for task in tasks:
                project_ids.add(str(task['project_id']))
            
            projects = {}
            for proj_id in project_ids:
                proj = self.projects_collection.find_one(
                    {'_id': convert_to_object_id(proj_id)}
                )
                if proj:
                    projects[proj_id] = serialize_doc(proj)
            
            dashboard = {
                'total_assigned': len(tasks),
                'by_status': self._count_by_status(tasks),
                'by_priority': self._count_by_priority(tasks),
                'overdue': self._count_overdue_tasks(tasks),
                'by_project': self._group_tasks_by_project(tasks),
                'recent_tasks': self._get_recent_tasks(tasks, limit=5),
                'projects': projects
            }
            
            return dashboard
        
        except Exception as e:
            print(f"User dashboard error: {str(e)}")
            return {}
    
    def _group_tasks_by_project(self, tasks):
        """Group tasks by project"""
        grouped = {}
        for task in tasks:
            proj_id = str(task['project_id'])
            if proj_id not in grouped:
                grouped[proj_id] = []
            grouped[proj_id].append(serialize_doc(task))
        return grouped
    
    def _get_recent_tasks(self, tasks, limit=5):
        """Get recent tasks sorted by creation date"""
        sorted_tasks = sorted(
            tasks,
            key=lambda x: x.get('created_at', ''),
            reverse=True
        )
        return [serialize_doc(t) for t in sorted_tasks[:limit]]
    
    def get_project_members_stats(self, project_id):
        """
        Get stats for each member in project
        
        Args:
            project_id: Project ID
        
        Returns:
            List of member stats
        """
        try:
            project_id_obj = convert_to_object_id(project_id)
            
            # Get project and members
            project = self.projects_collection.find_one({'_id': project_id_obj})
            if not project:
                return []
            
            members_stats = []
            for member in project.get('members', []):
                user_id = member['user_id']
                
                # Get stats for this member
                user_tasks = list(self.tasks_collection.find({
                    'project_id': project_id_obj,
                    'assigned_to': user_id
                }))
                
                # Get user info
                user = self.users_collection.find_one({'_id': user_id})
                if user:
                    stats = {
                        'user_id': str(user_id),
                        'name': user.get('name', 'Unknown'),
                        'email': user.get('email', ''),
                        'role': member['role'],
                        'total_tasks': len(user_tasks),
                        'completed_tasks': sum(1 for t in user_tasks if t.get('status') == 'done'),
                        'in_progress_tasks': sum(1 for t in user_tasks if t.get('status') == 'in_progress'),
                        'overdue_tasks': sum(1 for t in user_tasks if t.get('status') != 'done' and is_task_overdue(t.get('due_date')))
                    }
                    members_stats.append(stats)
            
            return members_stats
        
        except Exception as e:
            print(f"Project members stats error: {str(e)}")
            return []
