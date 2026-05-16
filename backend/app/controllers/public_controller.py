from flask_restx import Resource, Namespace
from flask import request
from app.extensions import mongo, db
from app.models.company import Company
from app.models.department import Department

ns = Namespace('public', description='Public Statistics')


# ─────────────────────────────────────────────
# GLOBAL STATS
# Called by index.html live telemetry button
# ─────────────────────────────────────────────
@ns.route('/stats')
class PublicStats(Resource):
    def get(self):
        """Global scan counts from MongoDB"""
        try:
            total_checks  = mongo.db.checks.count_documents({})
            pass_checks   = mongo.db.checks.count_documents({"type": "password"})
            email_checks  = mongo.db.checks.count_documents({"type": "email"})
            return {
                "status": "online",
                "total_scans": total_checks,
                "password_scans": pass_checks,
                "email_scans": email_checks
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500


# ─────────────────────────────────────────────
# COMPANY PUBLIC INFO
# Called by CompanyPortal.jsx to get name + departments
# ─────────────────────────────────────────────
@ns.route('/company/<string:company_id>')
class PublicCompanyInfo(Resource):
    def get(self, company_id):
        """Return company name and department list for the employee portal"""
        company = db.session.get(Company, company_id)
        if not company:
            return {"error": "Company not found"}, 404
        return {
            "name": company.name,
            "departments": [d.name for d in company.departments]
        }, 200