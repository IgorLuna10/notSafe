from flask_sqlalchemy import SQLAlchemy
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_caching import Cache
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200 per day", "50 per hour"])

# Initialize extensions here to avoid circular imports
db = SQLAlchemy()      # SQL Database
mongo = PyMongo()      # NoSQL Database (Logs)
bcrypt = Bcrypt()
cache = Cache()