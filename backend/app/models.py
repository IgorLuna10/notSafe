from . import mongo
from datetime import datetime
from flask_bcrypt import Bcrypt
import uuid

bcrypt = Bcrypt()

class Analytics:
    @staticmethod
    def get_stats(company_id=None):
        """
        Get stats. If company_id is provided, filter by that company.
        """
        query = {}
        if company_id:
            # We will link checks to companies via 'campaign_id' later
            # For now, let's keep it simple or filter by a 'company_id' field on checks
            query['company_id'] = company_id

        total = mongo.db.checks.count_documents(query)
        breached = mongo.db.checks.count_documents({**query, "is_breached": True})
        
        return {
            "total": total,
            "breached_count": breached,
            "safe_count": total - breached
        }

    @staticmethod
    def log_check(length, is_breached, campaign_id=None, department=None):
        """
        Logs a scan. 
        Crucial: We now accept 'campaign_id' and 'department' to link scans to companies.
        """
        mongo.db.checks.insert_one({
            "length": length,
            "is_breached": is_breached,
            "timestamp": datetime.utcnow(),
            "campaign_id": campaign_id,  # Link to the specific audit drive
            "department": department     # Link to the specific team (Sales, HR)
        })

    @staticmethod
    def reset_data(company_id=None):
        query = {}
        if company_id:
            query['company_id'] = company_id
        mongo.db.checks.delete_many(query)

# --- NEW: SAAS MODELS ---

class Company:
    @staticmethod
    def create(name, email, password):
        # 1. Check if email exists
        if mongo.db.companies.find_one({"email": email}):
            return None # User exists
        
        # 2. Hash Password
        pw_hash = bcrypt.generate_password_hash(password).decode('utf-8')
        
        # 3. Create ID and Insert
        company_id = str(uuid.uuid4())
        mongo.db.companies.insert_one({
            "_id": company_id,
            "name": name,
            "email": email,
            "password": pw_hash,
            "created_at": datetime.utcnow(),
            "departments": ["Engineering", "Sales", "Marketing", "HR"] # Default Depts
        })
        return company_id

    @staticmethod
    def verify_user(email, password):
        user = mongo.db.companies.find_one({"email": email})
        if user and bcrypt.check_password_hash(user['password'], password):
            return user
        return None

    @staticmethod
    def get_by_id(company_id):
        return mongo.db.companies.find_one({"_id": company_id})

class Campaign:
    """
    An Audit Campaign (e.g., 'Q1 Security Check').
    Employees belong to a Campaign, not just the company.
    """
    @staticmethod
    def create(company_id, name):
        camp_id = str(uuid.uuid4())
        mongo.db.campaigns.insert_one({
            "_id": camp_id,
            "company_id": company_id,
            "name": name,
            "created_at": datetime.utcnow(),
            "active": True
        })
        return camp_id

    @staticmethod
    def get_active(company_id):
        return mongo.db.campaigns.find_one({"company_id": company_id, "active": True})