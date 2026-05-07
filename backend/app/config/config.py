"""
Configuration management for the Flask application
Loads environment variables and sets up app configuration
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration"""
    
    # Flask Configuration
    DEBUG = False
    TESTING = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your_secret_key_change_in_production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ALGORITHM = 'HS256'
    
    # MongoDB Configuration
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb+srv://username:password@cluster.mongodb.net/team_task_manager')
    MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'team_task_manager')
    
    # CORS Configuration - Allow all common dev ports
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:5173').split(',')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/team_task_manager_test'


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False


# Select configuration based on environment
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on FLASK_ENV variable"""
    env = os.getenv('FLASK_ENV', 'development')
    return config.get(env, config['default'])
