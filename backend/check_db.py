from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

try:
    mongo_uri = os.getenv('MONGO_URI')
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
    db = client['team_task_manager']
    
    print('=== USERS COLLECTION ===')
    users = db['users'].find({}, {'password': 0})
    for user in users:
        print(f"  _id: {user['_id']}")
        print(f"  Name: {user.get('name', 'N/A')}")
        print(f"  Email: {user.get('email', 'N/A')}")
        print(f"  Role: {user.get('role', 'N/A')}")
        print()
    
    print('=== PROJECTS COLLECTION ===')
    projects = db['projects'].find()
    for proj in projects:
        print(f"  _id: {proj['_id']}")
        print(f"  Name: {proj.get('name', 'N/A')}")
        print(f"  Created by: {proj.get('created_by', 'N/A')}")
        print(f"  Members: {proj.get('members', [])}")
        print()
    
    print('=== TASKS COLLECTION ===')
    tasks = db['tasks'].find()
    task_count = db['tasks'].count_documents({})
    print(f"  Total tasks: {task_count}")
    
    client.close()
    
except Exception as e:
    print(f'Error: {str(e)}')
