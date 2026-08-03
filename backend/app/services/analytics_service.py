from app.models.company import Company
from app.extensions import mongo, db

class AnalyticsService:
    """
    Bridges SQL (Company Structure) and NoSQL (Security Logs).
    """

    @staticmethod
    def get_dashboard_data(company_id, user_role):
        # 1. SQL QUERY — db.session.get() is SQLAlchemy 2.x compatible
        company = db.session.get(Company, company_id)
        if not company:
            raise ValueError("Company not found")

        dept_names = [d.name for d in company.departments]

        # 2. NOSQL QUERY: Aggregate Logs by Department
        pipeline = [
            {"$match": {"type": "dept_check", "company_id": company_id}},
            {"$group": {
                "_id": "$department",
                "total": {"$sum": 1},
                "breached": {"$sum": {"$cond": [{"$eq": ["$is_breached", True]}, 1, 0]}}
            }}
        ]
        dept_stats = list(mongo.db.checks.aggregate(pipeline))

        # 3. Calculate Totals
        total_checks = sum(d['total'] for d in dept_stats)
        total_breaches = sum(d['breached'] for d in dept_stats)

        # 4. Serialize (convert MongoDB ObjectId to string)
        serializable_stats = [
            {
                "department": str(d['_id']),
                "total": d['total'],
                "breached": d['breached']
            }
            for d in dept_stats
        ]

        return {
            "company_name": company.name,
            "company_id": company.id,
            "role": user_role,
            "departments": dept_names,
            "stats": {
                "total": total_checks,
                "breached_count": total_breaches
            },
            "department_data": serializable_stats
        }