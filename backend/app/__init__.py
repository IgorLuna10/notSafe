from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from dotenv import load_dotenv
import os
import certifi

load_dotenv()

# Initialize Extensions
mongo = PyMongo()
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

    # Allow all origins (fixes NetworkError)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Init Extensions
    mongo.init_app(app, tlsCAFile=certifi.where())
    limiter.init_app(app)
    cache.init_app(app)

    with app.app_context():
        # Import from the single monolithic file
        from .routes import web_bp, api_bp
        
        app.register_blueprint(web_bp)
        app.register_blueprint(api_bp)
        
    return app