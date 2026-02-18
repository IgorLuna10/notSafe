from app.extensions import db
import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Company(db.Model):
    __tablename__ = 'companies'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    # Relationships (One-to-Many)
    users = db.relationship('User', backref='company', lazy=True)
    departments = db.relationship('Department', backref='company', lazy=True)