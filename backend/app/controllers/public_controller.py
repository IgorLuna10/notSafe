from flask_restx import Resource, Namespace
from app.extensions import mongo

ns = Namespace('public', description='Public Statistics')

@ns.route('/stats')
class PublicStats(Resource):
    def get(self):
        """Get global system stats (Total checks)"""
        try:
            # Count total documents in the NoSQL logs
            total_checks = mongo.db.checks.count_documents({})
            
            # Count breakdown
            pass_checks = mongo.db.checks.count_documents({"type": "password"})
            email_checks = mongo.db.checks.count_documents({"type": "email"})
            
            return {
                "status": "online",
                "total_scans": total_checks,
                "password_scans": pass_checks,
                "email_scans": email_checks
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500