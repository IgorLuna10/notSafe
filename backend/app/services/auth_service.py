from app.models.user import User
from app.models.company import Company
from app.models.department import Department
from app.extensions import db, bcrypt
import jwt
import os
import datetime
import secrets

DEFAULT_DEPARTMENTS = [
    'HR', 'Sales', 'Engineering', 'Finance', 'Marketing',
    'CEO', 'CFO', 'Operations', 'Legal', 'IT'
]


class AuthService:
    """Handles all Authentication Logic."""

    # ── REGISTER ─────────────────────────────────────────────────
    @staticmethod
    def register_company(name, email, password):
        if User.query.filter_by(email=email).first():
            raise ValueError("User already exists")

        new_company = Company(name=name)
        db.session.add(new_company)
        db.session.flush()

        for dept_name in DEFAULT_DEPARTMENTS:
            dept = Department(name=dept_name, company_id=new_company.id)
            db.session.add(dept)

        pw_hash  = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(email=email, password_hash=pw_hash, company_id=new_company.id)
        db.session.add(new_user)
        db.session.commit()
        return new_company.id

    # ── LOGIN ─────────────────────────────────────────────────────
    @staticmethod
    def login(email, password):
        user = User.query.filter_by(email=email).first()
        if user and bcrypt.check_password_hash(user.password_hash, password):
            token = jwt.encode(
                {
                    'user_id': user.id,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                },
                os.getenv('SECRET_KEY'),
                algorithm="HS256"
            )
            return {"token": token, "role": user.role, "company_id": user.company_id}
        return None

    # ── PASSWORD RESET: REQUEST ───────────────────────────────────
    @staticmethod
    def create_reset_token(email: str):
        """
        Generate a short-lived (1 h) signed reset token for the given email.
        Returns the token string, or None if the email does not exist.

        The token is a JWT containing:
          - sub   : user.id
          - email : user.email          (so we can verify it hasn't changed)
          - type  : "password_reset"    (so it can't be used as a login token)
          - jti   : random nonce        (one-time use guard — store in DB if needed)
          - exp   : now + 1 hour
        """
        user = User.query.filter_by(email=email).first()
        if not user:
            return None          # don't reveal whether the email exists

        token = jwt.encode(
            {
                'sub':   user.id,
                'email': user.email,
                'type':  'password_reset',
                'jti':   secrets.token_hex(16),   # unique nonce
                'exp':   datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            },
            os.getenv('SECRET_KEY'),
            algorithm="HS256"
        )
        return token

    # ── PASSWORD RESET: CONFIRM ───────────────────────────────────
    @staticmethod
    def reset_password(token: str, new_password: str):
        """
        Validate the reset token and set the new password.
        Returns True on success, raises ValueError on any failure.
        """
        try:
            payload = jwt.decode(
                token,
                os.getenv('SECRET_KEY'),
                algorithms=["HS256"]
            )
        except jwt.ExpiredSignatureError:
            raise ValueError("Reset link has expired. Please request a new one.")
        except jwt.InvalidTokenError:
            raise ValueError("Invalid reset link.")

        # Guard: only accept password-reset tokens
        if payload.get('type') != 'password_reset':
            raise ValueError("Invalid token type.")

        user = db.session.get(User, payload['sub'])
        if not user or user.email != payload.get('email'):
            raise ValueError("User not found or email mismatch.")

        if len(new_password) < 8:
            raise ValueError("Password must be at least 8 characters.")

        user.password_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        db.session.commit()
        return True