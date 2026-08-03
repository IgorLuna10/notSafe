from flask import Flask, render_template
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv
import os
import certifi

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
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_key_only')
    app.config['CACHE_TYPE'] = os.getenv('CACHE_TYPE', 'SimpleCache')

    # -------------------------
    # Extensions
    # -------------------------
    db.init_app(app)
    Migrate(app, db)
    bcrypt.init_app(app)
    cache.init_app(app)
    limiter.init_app(app)
    CORS(app)

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

    return app