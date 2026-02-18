from flask_sqlalchemy import SQLAlchemy
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_caching import Cache

# Initialize extensions here to avoid circular imports
db = SQLAlchemy()      # SQL Database
mongo = PyMongo()      # NoSQL Database (Logs)
bcrypt = Bcrypt()
cache = Cache()