from app.models.user import User
from app.models.company import Company
from app.extensions import db, bcrypt
import jwt
import os
import datetime

class AuthService:
    """
    Handles all Authentication Logic.
    This class is reusable and independent of Flask Routes.
    """
    
    @staticmethod
    def register_company(name, email, password):
        # 1. Check if user exists
        if User.query.filter_by(email=email).first():
            raise ValueError("User already exists")

        # 2. Create Company
        new_company = Company(name=name)
        db.session.add(new_company)
        db.session.flush() # Get ID before commit

        # 3. Hash Password
        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')

        # 4. Create Admin User
        new_user = User(email=email, password_hash=pw_hash, company_id=new_company.id)
        db.session.add(new_user)
        
        # 5. Commit Transaction
        db.session.commit()
        return new_company.id

    @staticmethod
    def login(email, password):
        user = User.query.filter_by(email=email).first()
        
        if user and bcrypt.check_password_hash(user.password_hash, password):
            # Generate JWT
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, os.getenv('SECRET_KEY'), algorithm="HS256")
            
            return {
                "token": token,
                "role": user.role,
                "company_id": user.company_id
            }
        return None