from flask import Blueprint, jsonify, request, render_template, session, redirect, url_for, make_response
from flask_restx import Api, Resource, fields
from flask_bcrypt import Bcrypt
import requests
import os
import re
import csv
import io
import json
import uuid
from functools import wraps
from datetime import datetime, timedelta
from .models import Analytics
from . import limiter, cache, mongo

# --- CONFIGURATION ---
bcrypt = Bcrypt()
web_bp = Blueprint('web', __name__)
api_bp = Blueprint('api_bp', __name__, url_prefix='/api')

authorizations = {
    'apikey': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'X-API-Key'
    }
}

api = Api(
    api_bp, 
    version='1.0', 
    title='notSafe. API', 
    description='Security Intelligence API',
    doc=False, 
    authorizations=authorizations
)

ns = api.namespace('v1', description='Operations')

# --- HELPERS ---
def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.headers.get('X-API-Key') == os.getenv('MASTER_API_KEY'):
            return f(*args, **kwargs)
        return {"error": "Unauthorized"}, 401
    return decorated

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # API-based check: if not logged in, return 401 JSON
        if not session.get('logged_in'):
            return {"error": "Unauthorized. Please login."}, 401
        return f(*args, **kwargs)
    return decorated

# ==========================================
#  PART 1: PUBLIC WEB PAGES (HTML)
# ==========================================

@web_bp.route('/')
def index():
    """
    PRESERVED: Serves the original Landing Page.
    The 'Login' button in this HTML should now point to your React Login URL.
    """
    return render_template('index.html')

@api_bp.route('/docs')
def swagger_ui():
    """PRESERVED: Serves the Swagger API Documentation."""
    return render_template('swagger.html')


# ==========================================
#  PART 2: AUTHENTICATION API (For React)
# ==========================================

@api_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return {"error": "Missing credentials"}, 400
    
    # Check if user exists
    if mongo.db.companies.find_one({"email": data['email']}):
        return {"error": "Email already exists"}, 409

    # Hash Password & Create
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    company_id = str(uuid.uuid4())
    
    mongo.db.companies.insert_one({
        "_id": company_id,
        "name": data.get('name', 'Company'),
        "email": data['email'],
        "password": hashed_pw,
        "created_at": datetime.utcnow()
    })
    return {"message": "Registered successfully"}, 201

@api_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = mongo.db.companies.find_one({"email": data.get('email')})

    if user and bcrypt.check_password_hash(user['password'], data.get('password')):
        session['user_id'] = user['_id']
        session['logged_in'] = True
        return {"message": "Login successful", "company": user['name']}, 200
    
    return {"error": "Invalid credentials"}, 401

@api_bp.route('/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return {"message": "Logged out"}, 200

@api_bp.route('/auth/status', methods=['GET'])
def auth_status():
    """Helper to check if user is already logged in."""
    return {"logged_in": session.get('logged_in', False)}, 200


# ==========================================
#  PART 3: DASHBOARD DATA API (For React)
# ==========================================

@api_bp.route('/dashboard/analytics', methods=['GET'])
@require_auth
def get_dashboard_data():
    """
    API Endpoint: Returns all dashboard analytics as JSON.
    This replaces the old 'render_template' dashboard route.
    """
    # 1. Global Stats
    stats = Analytics.get_stats()

    # 2. 30-Day Trends (Aggregation)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    trend_data = list(mongo.db.checks.aggregate([
        {"$match": {"timestamp": {"$gte": thirty_days_ago}}},
        {"$group": {
            "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
            "count": {"$sum": 1},
            "breaches": {"$sum": {"$cond": [{"$eq": ["$is_breached", True]}, 1, 0]}}
        }},
        {"$sort": {"_id": 1}}
    ]))

    # 3. Length Distribution (Aggregation)
    len_data = list(mongo.db.checks.aggregate([
        {"$project": {"bucket": {"$switch": {"branches": [
            {"case": {"$lt": ["$length", 8]}, "then": "<8 chars"},
            {"case": {"$and": [{"$gte": ["$length", 8]}, {"$lt": ["$length", 12]}]}, "then": "8-12 chars"},
            {"case": {"$and": [{"$gte": ["$length", 12]}, {"$lt": ["$length", 16]}]}, "then": "12-16 chars"}
        ], "default": "16+ chars"}}}},
        {"$group": {"_id": "$bucket", "count": {"$sum": 1}}}
    ]))
    len_map = {x['_id']: x['count'] for x in len_data}

    # 4. Return JSON Payload
    return jsonify({
        "stats": stats,
        "trends": {
            "labels": [x['_id'] for x in trend_data],
            "scans": [x['count'] for x in trend_data],
            "breaches": [x['breaches'] for x in trend_data]
        },
        "lengths": {
            "labels": ["<8 chars", "8-12 chars", "12-16 chars", "16+ chars"],
            "values": [len_map.get(k, 0) for k in ["<8 chars", "8-12 chars", "12-16 chars", "16+ chars"]]
        },
        # Simulated Advanced Data (To be replaced by real logic later)
        "advanced": {
            "dept_labels": ["Engineering", "Finance", "HR", "Marketing", "Sales"],
            "dept_scores": [95, 88, 72, 65, 54],
            "comp_data": [85, 98, 70, 40],
            "ent_labels": ["0-20 bits", "20-40 bits", "40-60 bits", "60-80 bits", "80+ bits"],
            "ent_values": [5, 15, 45, 25, 10]
        }
    }), 200

@web_bp.route('/export-csv')
def export_csv():
    """
    PRESERVED: Direct download link for the CSV report.
    We check auth inside the function logic.
    """
    if not session.get('logged_in'):
         # If accessing via browser, redirect to React Login
         # NOTE: You might need to adjust this URL depending on where React lives
         return redirect('/login')

    checks = list(mongo.db.checks.find().sort("timestamp", -1))
    
    # Calculate Summary
    total = len(checks)
    breached = sum(1 for c in checks if c.get('is_breached'))
    ratio = (total - breached) / total * 100 if total > 0 else 100

    si = io.StringIO()
    cw = csv.writer(si)

    # Executive Summary
    cw.writerow(['--- SECURITY AUDIT REPORT ---'])
    cw.writerow(['Generated', datetime.utcnow().strftime('%Y-%m-%d')])
    cw.writerow(['Total Scans', total, 'Compromised', breached, 'Safety Ratio', f"{ratio:.1f}%"])
    cw.writerow([])
    
    # Detailed Logs
    cw.writerow(['Audit ID', 'Date', 'Length', 'Status', 'Risk'])
    for i, c in enumerate(checks):
        status = "Compromised" if c.get('is_breached') else "Secure"
        risk = "Critical" if c.get('is_breached') else ("High" if c.get('length', 0) < 8 else "Low")
        cw.writerow([f"LOG-{1000+total-i}", c['timestamp'].strftime('%Y-%m-%d'), c.get('length'), status, risk])

    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=notsafe_report.csv"
    output.headers["Content-type"] = "text/csv"
    return output


# ==========================================
#  PART 4: PUBLIC API ENDPOINTS
# ==========================================

@ns.route('/check-prefix/<string:prefix>')
class PasswordCheck(Resource):
    @limiter.limit("30 per minute")
    @cache.cached(timeout=300)
    def get(self, prefix):
        if not re.match(r'^[a-fA-F0-9]{5}$', prefix): return {"error": "Invalid prefix"}, 400
        try:
            r = requests.get(f"https://api.pwnedpasswords.com/range/{prefix}")
            return {"prefix": prefix, "suffixes": r.text.splitlines()}, 200
        except: return {"error": "API Error"}, 502

@ns.route('/log-check')
class LogCheck(Resource):
    @ns.doc(security='apikey')
    @require_api_key
    def post(self):
        d = api.payload or {}
        Analytics.log_check(d.get('length', 0), d.get('is_breached', False))
        return {"status": "logged"}, 201

@ns.route('/reset-db')
class ResetDB(Resource):
    def post(self):
        # Allow reset if logged in OR if admin password provided
        is_admin_pw = request.json and request.json.get('password') == os.getenv('ADMIN_PASSWORD')
        if session.get('logged_in') or is_admin_pw:
            Analytics.reset_data()
            return {"message": "Database wiped"}, 200
        return {"error": "Unauthorized"}, 403