from flask import request
from flask_restx import Resource, Namespace
from app.services.auth_service import AuthService

# Create a Namespace (Grouping routes)
ns = Namespace('auth', description='Authentication Operations')

@ns.route('/register')
class RegisterController(Resource):
    def post(self):
        """Register a new Company"""
        data = request.get_json()
        try:
            company_id = AuthService.register_company(
                data.get('name'), 
                data.get('email'), 
                data.get('password')
            )
            return {"message": "Created", "company_id": company_id}, 201
        except ValueError as e:
            return {"error": str(e)}, 400

@ns.route('/login')
class LoginController(Resource):
    def post(self):
        """Login and get Token"""
        data = request.get_json()
        result = AuthService.login(data.get('email'), data.get('password'))
        
        if result:
            return result, 200
        return {"error": "Invalid credentials"}, 401