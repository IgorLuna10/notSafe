from . import mongo, bcrypt
from datetime import datetime, timedelta
import uuid
import jwt
import os

class User:
    @staticmethod
    def create(email, password, role='admin', company_id=None):
        if mongo.db.users.find_one({"email": email}):
            return None
        
        user_id = str(uuid.uuid4())
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        
        mongo.db.users.insert_one({
            "_id": user_id,
            "email": email,
            "password": hashed_pw,
            "role": role,
            "company_id": company_id,
            "created_at": datetime.utcnow(),
            "last_login": None,
            "is_active": True
        })
        return user_id

    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(token, os.getenv('SECRET_KEY'), algorithms=["HS256"])
            return payload['user_id']
        except:
            return None

class Company:
    @staticmethod
    def create(name, email, password):
        company_id = str(uuid.uuid4())
        mongo.db.companies.insert_one({
            "_id": company_id,
            "name": name,
            "owner_email": email,
            "created_at": datetime.utcnow(),
            "settings": {"scan_frequency": "daily", "alert_threshold": "high"},
            "departments": ["Engineering", "Sales", "HR", "Marketing"]
        })
        User.create(email, password, role='admin', company_id=company_id)
        return company_id

    @staticmethod
    def get_by_id(company_id):
        return mongo.db.companies.find_one({"_id": company_id})

class Task:
    @staticmethod
    def create(task_type, company_id, total_items=0):
        task_id = str(uuid.uuid4())
        mongo.db.tasks.insert_one({
            "_id": task_id,
            "company_id": company_id,
            "type": task_type,
            "status": "pending",
            "progress": 0,
            "total": total_items,
            "created_at": datetime.utcnow()
        })
        return task_id

    @staticmethod
    def complete(task_id):
        mongo.db.tasks.update_one(
            {"_id": task_id},
            {"$set": {"status": "completed", "progress": 100, "completed_at": datetime.utcnow()}}
        )

class Analytics:
    @staticmethod
    def get_stats(company_id=None):
        if company_id:
            # Private Company Stats
            query = {"company_id": company_id}
            total = mongo.db.employees.count_documents(query)
            breached = mongo.db.employees.count_documents({**query, "status": "breached"})
            return {"total": total, "breached_count": breached, "safe_count": total - breached}
        else:
            # Public Global Stats (Split by Type)
            # 1. Passwords
            pass_total = mongo.db.checks.count_documents({"type": "password"})
            pass_breached = mongo.db.checks.count_documents({"type": "password", "is_breached": True})
            
            # 2. Emails
            email_total = mongo.db.checks.count_documents({"type": "email"})
            email_breached = mongo.db.checks.count_documents({"type": "email", "is_breached": True})

            return {
                "total": pass_total + email_total,
                "breached_count": pass_breached + email_breached,
                "passwords": {"total": pass_total, "breached": pass_breached},
                "emails": {"total": email_total, "breached": email_breached}
            }

    @staticmethod
    def log_check(length, is_breached, check_type="password"):
        """Logs checks. Type can be 'password' or 'email'"""
        mongo.db.checks.insert_one({
            "type": check_type,
            "length": length, # 0 for emails
            "is_breached": is_breached,
            "timestamp": datetime.utcnow()
        })

    @staticmethod
    def reset_data():
        mongo.db.checks.delete_many({})
        mongo.db.employees.delete_many({})
        mongo.db.companies.delete_many({})
        mongo.db.users.delete_many({})
        mongo.db.tasks.delete_many({})

class Employee:
    @staticmethod
    def add_bulk(company_id, employees_list):
        if not employees_list: return 0
        docs = []
        for emp in employees_list:
            docs.append({
                "_id": str(uuid.uuid4()),
                "company_id": company_id,
                "email": emp.get('email'),
                "status": "pending_scan",
                "created_at": datetime.utcnow()
            })
        result = mongo.db.employees.insert_many(docs)
        return len(result.inserted_ids)