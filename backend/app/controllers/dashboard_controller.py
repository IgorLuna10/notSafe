from flask_restx import Resource, Namespace
from flask import request
from app.services.analytics_service import AnalyticsService
from app.utils.decorators import token_required
from app.extensions import db, mongo
from app.models.department import Department
from app.models.company import Company
import datetime
import html
import re

ns = Namespace('dashboard', description='Private Company Analytics')

# ─────────────────────────────────────────────
# XSS SANITIZATION HELPER
# Strips all HTML tags then escapes remaining chars.
# "Finance" stays "Finance". "<script>alert(1)</script>" becomes "".
# ─────────────────────────────────────────────
_TAG_RE = re.compile(r'<[^>]+>')

def sanitize_name(value: str) -> str:
    """Strip HTML/script tags then HTML-escape any remaining special chars. Idempotent."""
    # Unescape first to handle already-escaped input and prevent double-escaping
    unescaped = html.unescape(value)
    stripped = _TAG_RE.sub('', unescaped)
    return html.escape(stripped).strip()


# ─────────────────────────────────────────────
# COMPANY DASHBOARD ANALYTICS
# Called by Dashboard.jsx
# ─────────────────────────────────────────────
@ns.route('/analytics')
class DashboardAnalytics(Resource):
    @token_required
    def get(self, current_user):
        """Private dashboard data for logged-in company admin"""
        try:
            data = AnalyticsService.get_dashboard_data(
                company_id=current_user.company_id,
                user_role=current_user.role
            )
            return data, 200
        except ValueError as e:
            return {"error": str(e)}, 404
        except Exception as e:
            return {"error": "Internal Server Error"}, 500


# ─────────────────────────────────────────────
# GLOBAL INTELLIGENCE DASHBOARD
# Called by GlobalDashboard.jsx (public, no auth)
# ─────────────────────────────────────────────
@ns.route('/global')
class GlobalDashboard(Resource):
    def get(self):
        """Aggregated global stats + trends for the public intelligence page"""
        try:
            total       = mongo.db.checks.count_documents({})
            breached    = mongo.db.checks.count_documents({"is_breached": True})
            pw_total    = mongo.db.checks.count_documents({"type": "password"})
            pw_breached = mongo.db.checks.count_documents({"type": "password", "is_breached": True})
            em_total    = mongo.db.checks.count_documents({"type": "email"})
            em_breached = mongo.db.checks.count_documents({"type": "email", "is_breached": True})

            today = datetime.datetime.utcnow()
            labels, pw_trend, em_trend = [], [], []
            for i in range(29, -1, -1):
                day_start = today - datetime.timedelta(days=i)
                day_end   = today - datetime.timedelta(days=i - 1)
                labels.append(day_start.strftime("%b %d"))
                pw_trend.append(mongo.db.checks.count_documents({
                    "type": "password",
                    "timestamp": {"$gte": day_start, "$lt": day_end}
                }))
                em_trend.append(mongo.db.checks.count_documents({
                    "type": "email",
                    "timestamp": {"$gte": day_start, "$lt": day_end}
                }))

            length_labels = ["1-8", "9-12", "13-16", "17+"]
            length_ranges = [(1, 8), (9, 12), (13, 16), (17, 999)]
            length_values = [
                mongo.db.checks.count_documents({
                    "type": "password",
                    "length": {"$gte": lo, "$lte": hi}
                })
                for lo, hi in length_ranges
            ]

            return {
                "stats": {
                    "total": total,
                    "breached_count": breached,
                    "passwords": {"total": pw_total, "breached": pw_breached},
                    "emails":    {"total": em_total, "breached": em_breached}
                },
                "trends": {
                    "labels":         labels,
                    "password_scans": pw_trend,
                    "email_scans":    em_trend
                },
                "lengths": {
                    "labels": length_labels,
                    "values": length_values
                }
            }, 200
        except Exception as e:
            return {"error": str(e)}, 500


# ─────────────────────────────────────────────
# DEPARTMENT MANAGEMENT
# Called by Dashboard.jsx (add / delete departments)
# ─────────────────────────────────────────────
@ns.route('/company/departments')
class DepartmentManager(Resource):

    @token_required
    def post(self, current_user):
        """Add a new department to the current user's company"""
        data = request.get_json() or {}
        raw  = data.get('name', '')

        if not raw:
            return {"error": "Department name required"}, 400
        if len(raw) > 50:
            return {"error": "Department name too long (max 50 chars)"}, 400
        
        # Whitelist check on RAW name before sanitization
        # (Allows ampersands without failing due to escaped semicolons)
        if not re.match(r"^[\w\s\-&']+$", raw):
            return {"error": "Department name contains invalid characters"}, 400

        # --- XSS PROTECTION: strip tags, escape ---
        name = sanitize_name(raw)

        exists = Department.query.filter_by(
            company_id=current_user.company_id, name=name
        ).first()
        if exists:
            return {"error": f'Department "{name}" already exists'}, 409

        try:
            dept = Department(name=name, company_id=current_user.company_id)
            db.session.add(dept)
            db.session.commit()
            return {"message": "Department created", "name": name}, 201
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500

    @token_required
    def delete(self, current_user):
        """Delete a department from the current user's company"""
        data = request.get_json() or {}
        raw  = data.get('name', '')
        
        if not raw:
            return {"error": "Department name required"}, 400

        # Sanitize to match how it's stored (idempotent)
        name = sanitize_name(raw)

        dept = Department.query.filter_by(
            company_id=current_user.company_id, name=name
        ).first()
        if not dept:
            return {"error": "Department not found"}, 404

        try:
            db.session.delete(dept)
            db.session.commit()
            return {"message": f"{name} deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"error": f"Database error: {str(e)}"}, 500