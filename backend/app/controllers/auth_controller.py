from flask import request
from flask_restx import Resource, Namespace
from app.services.auth_service import AuthService

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



@ns.route('/forgot-password')
class ForgotPassword(Resource):
    def post(self):
        """Request a password-reset link"""
        data  = request.get_json() or {}
        email = data.get('email', '').lower().strip()

        if not email:
            return {"error": "Email is required"}, 400

        token = AuthService.create_reset_token(email)

        if token:
            # Send email with reset link
            reset_link = f"http://localhost:5173/reset-password?token={token}"
            print(f"\n[DEV] Password reset link for {email}:\n{reset_link}\n")

        # Always return the same response (anti-enumeration)
        return {
            "message": "If that email is registered you will receive a reset link shortly."
        }, 200


# ─────────────────────────────────────────────
# RESET PASSWORD
# POST /api/v1/auth/reset-password  { "token": "...", "password": "..." }
# ─────────────────────────────────────────────
@ns.route('/reset-password')
class ResetPassword(Resource):
    def post(self):
        """Confirm reset token and set new password"""
        data     = request.get_json() or {}
        token    = data.get('token', '').strip()
        password = data.get('password', '')

        if not token or not password:
            return {"error": "Token and new password are required"}, 400

        try:
            AuthService.reset_password(token, password)
            return {"message": "Password updated successfully. You can now log in."}, 200
        except ValueError as e:
            return {"error": str(e)}, 400