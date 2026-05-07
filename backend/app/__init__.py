"""
Flask application factory
Initializes Flask app with all configurations and blueprints
"""

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from app.config.config import get_config
from app.models.db import db_client

jwt = JWTManager()

def create_app():
    """
    Application factory function
    Creates and configures Flask application
    """
    # Create Flask app
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Initialize JWT
    jwt.init_app(app)
    
    # Enable CORS - allow all origins in development
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Initialize MongoDB connection
    try:
        db_client.connect()
    except Exception as e:
        print(f"Warning: Database connection deferred - {str(e)}")
    
    # Register error handlers
    register_error_handlers(app)
    
    # Test route
    @app.route("/", methods=['GET'])
    def home():
        return jsonify({
            "message": "Team Task Manager Backend Running Successfully",
            "version": "1.0.0",
            "status": "healthy"
        }), 200
    
    # API health check
    @app.route("/health", methods=['GET'])
    def health():
        return jsonify({"status": "healthy"}), 200
    
    # Register Blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.project_routes import project_bp
    from app.routes.task_routes import task_bp
    from app.routes.dashboard_routes import dashboard_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(project_bp, url_prefix="/api/projects")
    app.register_blueprint(task_bp, url_prefix="/api/tasks")
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    
    return app


def register_error_handlers(app):
    """
    Register Flask error handlers for common exceptions
    """
    
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            'success': False,
            'message': 'Endpoint not found',
            'error': 'Not Found'
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({
            'success': False,
            'message': 'Method not allowed',
            'error': 'Method Not Allowed'
        }), 405
    
    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({
            'success': False,
            'message': 'Internal server error',
            'error': str(e)
        }), 500
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Invalid token',
            'error': error
        }), 401
    
    @jwt.expired_token_loader
    def expired_token_loader(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Token has expired',
            'error': 'Token Expired'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'success': False,
            'message': 'Token is missing',
            'error': error
        }), 401
