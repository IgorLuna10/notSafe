from flask_restx import Resource, Namespace
from flask import request
from app.services.analytics_service import AnalyticsService
from app.utils.decorators import token_required

# Define the namespace for documentation
ns = Namespace('dashboard', description='Private Company Analytics')

@ns.route('/analytics')
class DashboardAnalytics(Resource):
    
    @token_required
    def get(self, current_user):
        """
        Get the hybrid SQL/NoSQL data for the dashboard.
        Requires a valid JWT token.
        """
        try:
            # Call the Service (The Brain)
            data = AnalyticsService.get_dashboard_data(
                company_id=current_user.company_id,
                user_role=current_user.role
            )
            return data, 200
        except ValueError as e:
            return {"error": str(e)}, 404
        except Exception as e:
            return {"error": "Internal Server Error"}, 500