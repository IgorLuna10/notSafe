from app.extensions import db
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    name = db.Column(db.String(50), nullable=False)
    
    # Foreign Key
    company_id = db.Column(db.String(36), db.ForeignKey('companies.id'), nullable=False)