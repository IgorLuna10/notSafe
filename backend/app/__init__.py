from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
import certifi


# Import Extensions
from .extensions import db, mongo, bcrypt, cache

# Import Controllers (Namespaces)
from .controllers.auth_controller import ns as auth_ns
from .controllers.dashboard_controller import ns as dashboard_ns
from .controllers.public_controller import ns as public_ns

from flask_restx import Api

load_dotenv()

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])

def create_app():
    app = Flask(__name__)

    # --- CONFIGURATION ---
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///notsafe.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_key')

    # --- INIT EXTENSIONS ---
    # 1. SQL Database
    db.init_app(app)
    Migrate(app, db) # Handles SQL migrations

    # 2. NoSQL Database (Logs)
    if 'localhost' in app.config['MONGO_URI'] or 'mongo' in app.config['MONGO_URI']:
        mongo.init_app(app)
    else:
        mongo.init_app(app, tlsCAFile=certifi.where())

    # 3. Security & Utils
    bcrypt.init_app(app)
    cache.init_app(app)
    limiter.init_app(app)
    CORS(app)

    # --- API SETUP ---
    api = Api(
        title='notSafe. API',
        version='3.0',
        description='Enterprise Hybrid SQL/NoSQL Security API',
        doc='/docs'
    )
    
    # Register Controllers
    api.add_namespace(auth_ns, path='/api/v1/auth')
    api.add_namespace(dashboard_ns, path='/api/v1/dashboard')
    api.add_namespace(public_ns, path='/api/v1/public')
    
    # Attach API to App
    api.init_app(app)

    # Create SQL Tables (Dev Mode)
    with app.app_context():
        db.create_all()

    return app