from app.extensions import db
import datetime
import uuid

# Helper to generate UUIDs
def generate_uuid():
    return str(uuid.uuid4())

class Company(db.Model):
    __tablename__ = 'companies'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships (The "Merise" Link)
    users = db.relationship('User', backref='company', lazy=True)
    departments = db.relationship('Department', backref='company', lazy=True)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='admin')
    
    # Foreign Key (Link to Company)
    company_id = db.Column(db.String(36), db.ForeignKey('companies.id'), nullable=False)

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(50), nullable=False)
    company_id = db.Column(db.String(36), db.ForeignKey('companies.id'), nullable=False)