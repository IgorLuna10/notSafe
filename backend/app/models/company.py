from app.extensions import db
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Company(db.Model):
    __tablename__ = 'companies'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(255), nullable=False)
    
    # Relationships
    users = db.relationship('User', back_populates='company', cascade='all, delete-orphan')
    departments = db.relationship('Department', back_populates='company', cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Company {self.name}>"
