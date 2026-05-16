<<<<<<< HEAD
from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_bcrypt import Bcrypt
=======
from flask import Flask, render_template
from flask_cors import CORS
from flask_migrate import Migrate
>>>>>>> d2768f1 (chore: remove per-folder gitignore and dockerignore, consolidated at root)
from dotenv import load_dotenv
import os
import certifi

<<<<<<< HEAD
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

=======
from .extensions import db, mongo, bcrypt, cache, limiter
from .controllers.auth_controller import ns as auth_ns
from .controllers.dashboard_controller import ns as dashboard_ns
from .controllers.public_controller import ns as public_ns
from .controllers.tools_controller import ns as tools_ns
from flask_restx import Api

load_dotenv()


def create_app():
    app = Flask(__name__, static_folder='static', template_folder='templates')

    # -------------------------
    # Configuration
    # -------------------------
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///notsafe.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
>>>>>>> d2768f1 (chore: remove per-folder gitignore and dockerignore, consolidated at root)
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_key_only')
    app.config['CACHE_TYPE'] = os.getenv('CACHE_TYPE', 'SimpleCache')

<<<<<<< HEAD
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
    
=======
    # -------------------------
    # Extensions
    # -------------------------
    db.init_app(app)
    Migrate(app, db)
>>>>>>> d2768f1 (chore: remove per-folder gitignore and dockerignore, consolidated at root)
    bcrypt.init_app(app)
    limiter.init_app(app)
    cache.init_app(app)

<<<<<<< HEAD
    with app.app_context():
        # Import from the routes file
        from .routes import web_bp, api_bp
        
        app.register_blueprint(web_bp)
        app.register_blueprint(api_bp)
        
=======
    # MongoDB — handle SSL for prod vs local
    mongo_uri = app.config['MONGO_URI']
    if not mongo_uri:
        print("⚠️  WARNING: MONGO_URI is not set.")
    elif 'localhost' in mongo_uri or 'mongo' in mongo_uri:
        mongo.init_app(app)
    else:
        mongo.init_app(app, tlsCAFile=certifi.where())

    # -------------------------
    # Root route BEFORE api.init_app
    # Flask-RESTX overwrites '/' if registered after
    # -------------------------
    @app.route('/')
    def index():
        return render_template('index.html')

    # -------------------------
    # API + Namespaces
    # -------------------------
    api = Api(
        app,
        title='notSafe. API',
        version='3.0',
        description='Enterprise Hybrid SQL/NoSQL Security API',
        doc='/docs'
    )

    api.add_namespace(auth_ns,      path='/api/v1/auth')
    api.add_namespace(dashboard_ns, path='/api/v1/dashboard')
    api.add_namespace(public_ns,    path='/api/v1/public')
    api.add_namespace(tools_ns,     path='/api/v1')

    # -------------------------
    # Database Setup
    # -------------------------
    with app.app_context():
        try:
            db.create_all()
            print("✅ SQL Tables verified.")
        except Exception as e:
            print(f"⚠️  SQL Init Error: {e}")

>>>>>>> d2768f1 (chore: remove per-folder gitignore and dockerignore, consolidated at root)
    return app