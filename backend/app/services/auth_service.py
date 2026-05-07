"""
Authentication service - handles signup, login, password hashing
Business logic for user authentication
"""

from app.models.db import get_db
from app.utils.helpers import serialize_doc, is_valid_email, get_current_timestamp, convert_to_object_id
from bcrypt import hashpw, checkpw, gensalt
from bson import ObjectId

class AuthService:
    """Service class for authentication operations"""
    
    def __init__(self):
        self.db = get_db()
        self.users_collection = self.db['users']
    
    def hash_password(self, password):
        """
        Hash password using bcrypt
        
        Args:
            password: Plain text password
        
        Returns:
            Hashed password (bytes)
        """
        try:
            # Encode password to bytes and hash with salt
            salt = gensalt(rounds=12)
            hashed = hashpw(password.encode('utf-8'), salt)
            return hashed
        except Exception as e:
            raise Exception(f"Password hashing failed: {str(e)}")
    
    def verify_password(self, plain_password, hashed_password):
        """
        Verify plain password against hashed password
        
        Args:
            plain_password: Plain text password from user
            hashed_password: Hashed password from database
        
        Returns:
            Boolean indicating if passwords match
        """
        try:
            # Handle both string and bytes formats
            if isinstance(hashed_password, str):
                hashed_password = hashed_password.encode('utf-8')
            return checkpw(plain_password.encode('utf-8'), hashed_password)
        except Exception as e:
            print(f"Password verification error: {str(e)}")
            return False
    
    def signup(self, name, email, password, role='member', employee_id=None, designation=None):
        """
        Register a new user
        
        Args:
            name: User's name
            email: User's email (must be unique)
            password: User's password (will be hashed)
            role: User's role ('admin' or 'member', defaults to 'member')
            employee_id: Employee ID (optional)
            designation: Job designation (optional, typically for members)
        
        Returns:
            Tuple (success, user_id, message, user_data)
        """
        try:
            # Validate email format
            if not is_valid_email(email):
                return False, None, "Invalid email format", None
            
            # Check if email already exists
            existing_user = self.users_collection.find_one({'email': email})
            if existing_user:
                return False, None, "Email already registered", None
            
            # Validate inputs
            if not name or len(name) < 2:
                return False, None, "Name must be at least 2 characters", None
            
            if not password or len(password) < 6:
                return False, None, "Password must be at least 6 characters", None
            
            # Validate role
            if role not in ['admin', 'member']:
                role = 'member'
            
            # Hash password
            hashed_password = self.hash_password(password)
            
            # Create user document
            user_doc = {
                'name': name,
                'email': email,
                'password': hashed_password,  # Bcrypt returns bytes, MongoDB stores as binary
                'role': role,  # Store user's global role
                'employee_id': employee_id,
                'designation': designation,
                'created_at': get_current_timestamp()
            }
            
            # Insert user into database
            result = self.users_collection.insert_one(user_doc)
            
            # Prepare user data for response
            user_data = {
                '_id': str(result.inserted_id),
                'name': name,
                'email': email,
                'role': role,
                'employee_id': employee_id,
                'designation': designation,
                'created_at': user_doc['created_at']
            }
            
            return True, str(result.inserted_id), "User created successfully", user_data
        
        except Exception as e:
            print(f"Signup error: {str(e)}")
            return False, None, f"Signup failed: {str(e)}"
    
    def login(self, identifier, password):
        """
        Authenticate user and return user data
        
        Args:
            identifier: User's email or employee ID
            password: User's password
        
        Returns:
            Tuple (success, user_data, message)
        """
        try:
            # Find user by email or employee_id
            user = self.users_collection.find_one({
                '$or': [
                    {'email': identifier},
                    {'employee_id': identifier}
                ]
            })
            
            if not user:
                return False, None, "Email not found"
            
            # Verify password
            if not self.verify_password(password, user['password']):
                return False, None, "Invalid password"
            
            # Remove password from response
            user_data = serialize_doc(user)
            if 'password' in user_data:
                del user_data['password']
            
            return True, user_data, "Login successful"
        
        except Exception as e:
            print(f"Login error: {str(e)}")
            return False, None, f"Login failed: {str(e)}"
    
    def get_user_by_id(self, user_id):
        """
        Get user by ID
        
        Args:
            user_id: User's ID (string)
        
        Returns:
            User document or None
        """
        try:
            user_id_obj = convert_to_object_id(user_id)
            user = self.users_collection.find_one({'_id': user_id_obj})
            if user:
                user_data = serialize_doc(user)
                # Remove password from response
                if 'password' in user_data:
                    del user_data['password']
                return user_data
            return None
        except Exception as e:
            print(f"Get user by ID error: {str(e)}")
            return None
        except Exception as e:
            print(f"Get user error: {str(e)}")
            return None
    
    def get_user_by_email(self, email):
        """
        Get user by email
        
        Args:
            email: User's email
        
        Returns:
            User document or None
        """
        try:
            user = self.users_collection.find_one({'email': email})
            return serialize_doc(user)
        except Exception as e:
            print(f"Get user by email error: {str(e)}")
            return None