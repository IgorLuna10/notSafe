from flask import Blueprint, jsonify, request, render_template
from flask_restx import Api, Resource
import requests
import os
import re
import csv
import io
import jwt
import datetime
from functools import wraps
from .models import Analytics, Company, Employee, User, Task
from . import limiter, cache, mongo, bcrypt 

# --- CONFIGURATION ---
web_bp = Blueprint('web', __name__)
api_bp = Blueprint('api_bp', __name__, url_prefix='/api')

authorizations = {
    'apikey': {'type': 'apiKey', 'in': 'header', 'name': 'X-API-Key'},
    'jwt': {'type': 'apiKey', 'in': 'header', 'name': 'Authorization'}
}

api = Api(api_bp, version='2.0', title='notSafe. API', authorizations=authorizations, doc=False)
ns = api.namespace('v1', description='Operations')

# --- AUTH DECORATOR ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token: return {'error': 'Token missing'}, 401
        
        user_id = User.verify_token(token)
        if not user_id: return {'error': 'Invalid token'}, 401
            
        current_user = mongo.db.users.find_one({"_id": user_id})
        if not current_user: return {'error': 'User not found'}, 401
            
        return f(current_user, *args, **kwargs)
    return decorated

# ==========================================
#  PART 1: PUBLIC & AUTH
# ==========================================

@web_bp.route('/')
def index(): return render_template('index.html')

@api_bp.route('/v1/status', methods=['GET'])
def system_status():
    return {"status": "online", "timestamp": datetime.datetime.utcnow().isoformat()}, 200

@api_bp.route('/v1/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        company_id = Company.create(data.get('name', 'Company'), data['email'].lower(), data['password'])
        if not company_id: return {"error": "User exists"}, 400
        return {"message": "Registered", "company_id": company_id}, 201
    except Exception as e: return {"error": str(e)}, 500

@api_bp.route('/v1/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.users.find_one({"email": data['email'].lower()})
    
    if user and bcrypt.check_password_hash(user['password'], data['password']):
        token = jwt.encode({
            'user_id': user['_id'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, os.getenv('SECRET_KEY'), algorithm="HS256")
        return {"token": token, "role": user['role'], "company_id": user['company_id']}, 200
    return {"error": "Invalid credentials"}, 401

# ==========================================
#  PART 2: DASHBOARDS
# ==========================================

@api_bp.route('/v1/dashboard/global', methods=['GET'])
def get_global_dashboard():
    stats = Analytics.get_stats(None)
    thirty_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    
    trend_data = list(mongo.db.checks.aggregate([
        {"$match": {"timestamp": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "password_scans": {"$sum": {"$cond": [{"$eq": ["$type", "password"]}, 1, 0]}},
            "email_scans": {"$sum": {"$cond": [{"$eq": ["$type", "email"]}, 1, 0]}},
            "total_breaches": {"$sum": {"$cond": [{"$eq": ["$is_breached", True]}, 1, 0]}}
        }},
        {"$sort": {"_id": 1}}
    ]))

    len_data = list(mongo.db.checks.aggregate([
        {"$match": {"type": "password"}},
        {"$project": {"bucket": {"$switch": {"branches": [
            {"case": {"$lt": ["$length", 8]}, "then": "<8"},
            {"case": {"$and": [{"$gte": ["$length", 8]}, {"$lt": ["$length", 12]}]}, "then": "8-12"},
            {"case": {"$and": [{"$gte": ["$length", 12]}, {"$lt": ["$length", 16]}]}, "then": "12-16"}
        ], "default": "16+"}}}},
        {"$group": {"_id": "$bucket", "count": {"$sum": 1}}}
    ]))
    len_map = {x['_id']: x['count'] for x in len_data}

    return jsonify({
        "stats": stats,
        "trends": {
            "labels": [x['_id'] for x in trend_data],
            "password_scans": [x['password_scans'] for x in trend_data],
            "email_scans": [x['email_scans'] for x in trend_data],
            "breaches": [x['total_breaches'] for x in trend_data]
        },
        "lengths": {
            "labels": ["<8", "8-12", "12-16", "16+"],
            "values": [len_map.get(k, 0) for k in ["<8", "8-12", "12-16", "16+"]]
        }
    }), 200

@api_bp.route('/v1/dashboard/analytics', methods=['GET'])
@token_required
def get_dashboard_data(current_user):
    company_id = current_user['company_id']
    company = Company.get_by_id(company_id)
    
    # Aggregation: Risk by Department
    pipeline = [
        {"$match": {"type": "dept_check", "company_id": company_id}},
        {"$group": {
            "_id": "$department",
            "total": {"$sum": 1},
            "breached": {"$sum": {"$cond": [{"$eq": ["$is_breached", True]}, 1, 0]}}
        }}
    ]
    dept_stats = list(mongo.db.checks.aggregate(pipeline))
    
    total_checks = sum(d['total'] for d in dept_stats)
    total_breaches = sum(d['breached'] for d in dept_stats)

    return jsonify({
        "company_name": company['name'],
        "company_id": company_id, # Required for Portal Link
        "stats": {"total": total_checks, "breached_count": total_breaches},
        "departments": company.get('departments', []),
        "department_data": dept_stats,
        "global_context": Analytics.get_stats(None),
        "role": current_user['role']
    }), 200

# ==========================================
#  PART 3: DEPARTMENT & PORTAL MANAGEMENT
# ==========================================

# PUBLIC: Fetch Company Info for Portal (No Auth)
@api_bp.route('/v1/public/company/<string:company_id>', methods=['GET'])
def get_public_company_info(company_id):
    company = mongo.db.companies.find_one({"_id": company_id})
    if not company: return {"error": "Company not found"}, 404
    return {
        "name": company.get('name'),
        "departments": company.get('departments', [])
    }, 200

# ADMIN: Manage Departments
@api_bp.route('/v1/company/departments', methods=['POST'])
@token_required
def add_department(current_user):
    dept_name = request.json.get('name')
    if not dept_name: return {"error": "Name required"}, 400
    mongo.db.companies.update_one(
        {"_id": current_user['company_id']},
        {"$addToSet": {"departments": dept_name}}
    )
    return {"message": "Department added"}, 200

@api_bp.route('/v1/company/departments', methods=['DELETE'])
@token_required
def remove_department(current_user):
    dept_name = request.json.get('name')
    mongo.db.companies.update_one(
        {"_id": current_user['company_id']},
        {"$pull": {"departments": dept_name}}
    )
    return {"message": "Department removed"}, 200

# ANONYMOUS: Log Check from Portal
@ns.route('/log-dept-check')
class LogDeptCheck(Resource):
    def post(self):
        d = api.payload
        company_id = d.get('company_id')
        dept = d.get('department')
        length = d.get('length')
        is_breached = d.get('is_breached')

        if not company_id or not dept: return {"error": "Missing metadata"}, 400

        mongo.db.checks.insert_one({
            "type": "dept_check",
            "company_id": company_id,
            "department": dept,
            "length": length,
            "is_breached": is_breached,
            "timestamp": datetime.datetime.utcnow()
        })
        return {"status": "logged"}, 201

# ==========================================
#  PART 4: PUBLIC TOOLS
# ==========================================

@ns.route('/check-prefix/<string:prefix>')
class PasswordCheck(Resource):
    @limiter.limit("60 per minute")
    @cache.cached(timeout=300)
    def get(self, prefix):
        if not re.match(r'^[a-fA-F0-9]{5}$', prefix): return {"error": "Invalid prefix"}, 400
        try:
            r = requests.get(f"https://api.pwnedpasswords.com/range/{prefix}")
            return {"prefix": prefix, "suffixes": r.text.splitlines()}, 200
        except: return {"error": "API Error"}, 502

@ns.route('/log-check')
class LogCheck(Resource):
    def post(self):
        d = api.payload or {}
        Analytics.log_check(int(d.get('length', 0)), d.get('is_breached', False), "password")
        return {"status": "logged"}, 201

@ns.route('/email-check')
class EmailScanner(Resource):
    @limiter.limit("10 per minute")
    def post(self):
        data = request.get_json()
        email = data.get('email', '').lower()
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email): return {"error": "Invalid"}, 400
        
        is_breached = any(x in email for x in ['admin', 'test', 'ceo'])
        res = {"status": "breached" if is_breached else "safe", "risk_score": 90 if is_breached else 10, "sources": []}
        
        Analytics.log_check(0, is_breached, "email")
        return res, 200

@ns.route('/reset-db')
class ResetDB(Resource):
    def post(self):
        if request.json.get('password') == os.getenv('ADMIN_PASSWORD'):
            Analytics.reset_data()
            return {"message": "DB Wiped"}, 200
        return {"error": "Forbidden"}, 403