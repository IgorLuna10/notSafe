from app.models.company import Company
from app.models.department import Department
from app.extensions import mongo

class AnalyticsService:
    """
    The 'Brain' that bridges SQL (Company Structure) and NoSQL (Security Logs).
    """

    @staticmethod
    def get_dashboard_data(company_id, user_role):
        # 1. SQL QUERY: Get Company Name & Departments
        company = Company.query.get(company_id)
        if not company:
            raise ValueError("Company not found")

        # Convert SQL objects to a simple list of names
        dept_names = [d.name for d in company.departments]

        # 2. NOSQL QUERY: Aggregate Logs by Department
        # We use MongoDB's aggregation pipeline for speed
        pipeline = [
            {"$match": {"type": "dept_check", "company_id": company_id}},
            {"$group": {
                "_id": "$department",
                "total": {"$sum": 1},
                "breached": {"$sum": {"$cond": [{"$eq": ["$is_breached", True]}, 1, 0]}}
            }}
        ]
        dept_stats = list(mongo.db.checks.aggregate(pipeline))
        
        # 3. Calculate Totals (Pure Python Logic)
        total_checks = sum(d['total'] for d in dept_stats)
        total_breaches = sum(d['breached'] for d in dept_stats)

        # 4. Construct the Data Object
        return {
            "company_name": company.name,
            "company_id": company.id,
            "role": user_role,
            "departments": dept_names,
            "stats": {
                "total": total_checks,
                "breached_count": total_breaches
            },
            "department_data": dept_stats
        }