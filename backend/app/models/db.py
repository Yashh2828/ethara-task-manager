"""
MongoDB connection and client management
Handles database initialization and provides database access
"""

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

class MongoDBClient:
    """MongoDB client wrapper for connection management"""
    
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        """Singleton pattern to ensure only one MongoDB connection"""
        if cls._instance is None:
            cls._instance = super(MongoDBClient, cls).__new__(cls)
        return cls._instance
    
    def connect(self):
        """
        Initialize MongoDB connection
        Raises: ConnectionFailure if connection fails
        """
        try:
            if self._client is None:
                mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://username:password@cluster.mongodb.net/team_task_manager')
                db_name = os.getenv('MONGO_DB_NAME', 'team_task_manager')
                
                # Create MongoDB client with connection pooling
                self._client = MongoClient(
                    mongo_uri,
                    serverSelectionTimeoutMS=5000,  # 5 second timeout
                    connectTimeoutMS=10000,
                    socketTimeoutMS=None,
                    maxPoolSize=50,
                    minPoolSize=1
                )
                
                # Test the connection
                self._client.admin.command('ping')
                print("✓ MongoDB connected successfully")
                
                # Get database reference
                self._db = self._client[db_name]
                self._setup_indexes()
                
        except (ServerSelectionTimeoutError, ConnectionFailure) as e:
            print(f"✗ MongoDB connection failed: {str(e)}")
            raise ConnectionFailure(f"Failed to connect to MongoDB: {str(e)}")
    
    def _setup_indexes(self):
        """Create necessary indexes for better query performance"""
        try:
            # Users collection indexes
            self._db['users'].create_index('email', unique=True)
            
            # Projects collection indexes
            self._db['projects'].create_index('created_by')
            
            # Tasks collection indexes
            self._db['tasks'].create_index('project_id')
            self._db['tasks'].create_index('assigned_to')
            self._db['tasks'].create_index([('project_id', 1), ('status', 1)])
            self._db['tasks'].create_index('due_date')
            
            print("✓ Database indexes created successfully")
        except Exception as e:
            print(f"⚠ Warning: Could not create indexes: {str(e)}")
    
    def get_db(self):
        """Get database instance"""
        if self._db is None:
            self.connect()
        return self._db
    
    def get_client(self):
        """Get MongoDB client instance"""
        if self._client is None:
            self.connect()
        return self._client
    
    def close(self):
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            self._client = None
            self._db = None
            print("✓ MongoDB connection closed")


# Global database client instance
db_client = MongoDBClient()

def get_db():
    """Helper function to get database instance"""
    return db_client.get_db()

def get_collections():
    """Get all collection references"""
    db = get_db()
    return {
        'users': db['users'],
        'projects': db['projects'],
        'tasks': db['tasks']
    }