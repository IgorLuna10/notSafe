from functools import wraps
from flask import request, current_app
import jwt
from app.models.user import User
from app.extensions import db

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 1. Get Token from Header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        if not token:
            return {'message': 'Token is missing!'}, 401

        try:
            # 2. Decode Token
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])

            # 3. Find User — use db.session.get() (SQLAlchemy 2.x compatible)
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                return {'message': 'User not found'}, 401
        except jwt.ExpiredSignatureError:
            return {'message': 'Token has expired!'}, 401
        except jwt.InvalidTokenError as e:
            return {'message': 'Token is invalid!', 'error': str(e)}, 401
        except Exception as e:
            return {'message': 'Authentication error', 'error': str(e)}, 401

        # 4. Pass current_user to the protected route
        return f(*args, current_user=current_user, **kwargs)
    return decorated

