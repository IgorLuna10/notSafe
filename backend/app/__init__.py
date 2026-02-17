from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_bcrypt import Bcrypt
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

# Initialize Extensions
mongo = PyMongo()
bcrypt = Bcrypt()
# Use SimpleCache so you don't need Redis running
cache = Cache(config={'CACHE_TYPE': 'SimpleCache'})
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])

def create_app():
    # Explicitly set static folder so images load
    app = Flask(__name__, 
                static_folder='static',
                template_folder='templates')

    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_key')

    # Allow API requests from frontend
    CORS(app, resources={r"/*": {"origins": "*"}})

    # --- FIX IS HERE ---
    # Only use SSL (certifi) if connecting to a real cloud server (Atlas).
    # For local Docker ('mongo'), we must disable TLS.
    if 'localhost' in app.config['MONGO_URI'] or 'mongo' in app.config['MONGO_URI']:
        # Local Docker Mode
        mongo.init_app(app)
    else:
        # Production / Cloud Mode
        mongo.init_app(app, tlsCAFile=certifi.where())
    
    bcrypt.init_app(app)
    limiter.init_app(app)
    cache.init_app(app)

    with app.app_context():
        # Import from the routes file
        from .routes import web_bp, api_bp
        
        app.register_blueprint(web_bp)
        app.register_blueprint(api_bp)
        
    return app