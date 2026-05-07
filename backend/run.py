"""
Entry point for the Flask application
Runs the development server or production server based on configuration
"""

import os
from app import create_app
from app.models.db import db_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask app
app = create_app()

if __name__ == "__main__":
    # Get configuration
    flask_env = os.getenv('FLASK_ENV', 'development')
    debug_mode = os.getenv('DEBUG', 'True').lower() == 'true'
    port = int(os.getenv('PORT', 5000))
    host = os.getenv('HOST', '0.0.0.0')
    
    print(f"\n{'='*50}")
    print(f"Starting Team Task Manager Backend")
    print(f"Environment: {flask_env}")
    print(f"Debug Mode: {debug_mode}")
    print(f"Server: {host}:{port}")
    print(f"{'='*50}\n")
    
    # Run the application
    app.run(
        host=host,
        port=port,
        debug=debug_mode,
        use_reloader=debug_mode
    )
    
    # Cleanup on shutdown
    db_client.close()