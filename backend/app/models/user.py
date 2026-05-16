from app.extensions import db
import uuid
import jwt
import os

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='admin')
    
    # Foreign Key
    company_id = db.Column(db.String(36), db.ForeignKey('companies.id'), nullable=False)

    # --- THIS WAS MISSING ---
    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
            return payload['user_id']
        except:
            return None