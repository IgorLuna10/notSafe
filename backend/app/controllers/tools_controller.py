from flask import request
from flask_restx import Resource, Namespace
import requests
import re
from app.extensions import limiter, cache, mongo
import datetime

ns = Namespace('tools', description='Public Security Tools')


# ─────────────────────────────────────────────
# PASSWORD BREACH CHECK (HIBP Proxy)
# ─────────────────────────────────────────────
@ns.route('/check-prefix/<string:prefix>')
class PasswordCheck(Resource):
    @limiter.limit("60 per minute")
    @cache.cached(timeout=300, key_prefix=lambda: f"prefix_{request.view_args.get('prefix','')}")
    def get(self, prefix):
        """HIBP Proxy — frontend: /api/v1/check-prefix/ABCDE"""
        if not re.match(r'^[a-fA-F0-9]{5}$', prefix):
            return {"error": "Invalid prefix"}, 400
        try:
            r = requests.get(f"https://api.pwnedpasswords.com/range/{prefix}", timeout=5)
            r.raise_for_status()
            return {"prefix": prefix, "suffixes": r.text.splitlines()}, 200
        except Exception:
            return {"error": "External API Error"}, 502


# ─────────────────────────────────────────────
# ANONYMOUS PASSWORD CHECK LOG
# ─────────────────────────────────────────────
@ns.route('/log-check')
class LogCheck(Resource):
    def post(self):
        """Log an anonymous password check to MongoDB"""
        data = request.get_json() or {}
        try:
            mongo.db.checks.insert_one({
                "type": "password",
                "length": data.get('length', 0),
                "is_breached": data.get('is_breached', False),
                "timestamp": datetime.datetime.utcnow()
            })
        except Exception:
            pass
        return {"status": "logged"}, 201



@ns.route('/email-check')
class EmailScanner(Resource):
    @limiter.limit("10 per minute")
    def post(self):
        """Real dark web email scan via XposedOrNot API"""
        body = request.get_json()
        if not body:
            return {"error": "No JSON body provided"}, 400

        email = body.get('email', '').lower().strip()
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return {"error": "Invalid Email Format"}, 400

        is_breached = False
        sources     = []
        risk_score  = 10

        try:
            xon_res = requests.get(
                f"https://api.xposedornot.com/v1/check-email/{email}",
                timeout=8,
                headers={"User-Agent": "notSafe-Security-Tool/1.0"}
            )

            if xon_res.status_code == 200:
                is_breached = True
                xon_data    = xon_res.json()

                # ── Extract breach list defensively ──────────────
                breach_list = []

                exposed = xon_data.get("ExposedBreaches", {})
                if isinstance(exposed, dict):
                    breach_list = exposed.get("breaches", [])
                elif isinstance(exposed, list):
                    breach_list = exposed

                if not breach_list:
                    breach_list = xon_data.get("breaches", [])

                # ── Parse each breach entry ──────────────────────
                # Handle nested lists (some API versions return [[...]])
                flattened_breaches = []
                for b in breach_list:
                    if isinstance(b, list):
                        flattened_breaches.extend(b)
                    else:
                        flattened_breaches.append(b)

                for b in flattened_breaches[:10]:

                    # Older API shape: plain string (just the breach name)
                    if isinstance(b, str):
                        sources.append({"name": b, "date": "Unknown", "data": []})
                        continue

                    if not isinstance(b, dict):
                        continue

                    name        = b.get("breach") or b.get("name") or "Unknown Breach"
                    xposed_date = b.get("xposed_date") or b.get("date") or ""
                    date_short  = xposed_date[:7] if len(xposed_date) >= 7 else (xposed_date or "Unknown")

                    # xposed_data is a semicolon-separated string (e.g. "Emails;Passwords")
                    raw = b.get("xposed_data") or b.get("data") or ""
                    if isinstance(raw, str):
                        data_tags = [x.strip().lower() for x in raw.split(";") if x.strip()]
                    elif isinstance(raw, list):
                        data_tags = [str(x).lower() for x in raw]
                    else:
                        data_tags = []

                    sources.append({"name": name, "date": date_short, "data": data_tags})

                risk_score = min(98, 10 + len(sources) * 8)

            elif xon_res.status_code == 404:
                is_breached = False  # clean — not in any breach
            else:
                is_breached = False

        except requests.exceptions.Timeout:
            return {"error": "Email scan service timed out. Please try again."}, 504
        except requests.exceptions.RequestException:
            return {"error": "Email scan service unreachable. Please try again."}, 502

        # ── Log to MongoDB ────────────────────────────────────────
        try:
            mongo.db.checks.insert_one({
                "type": "email",
                "length": 0,
                "is_breached": is_breached,
                "breach_count": len(sources),
                "timestamp": datetime.datetime.utcnow()
            })
        except Exception:
            pass

        return {
            "status": "breached" if is_breached else "safe",
            "risk_score": risk_score,
            "breach_count": len(sources),
            "sources": sources
        }, 200


# ─────────────────────────────────────────────
# ANONYMOUS DEPARTMENT CHECK LOG
# Called by CompanyPortal.jsx
# ─────────────────────────────────────────────
@ns.route('/log-dept-check')
class LogDeptCheck(Resource):
    def post(self):
        """Log an anonymous department password check"""
        data = request.get_json() or {}
        try:
            mongo.db.checks.insert_one({
                "type": "dept_check",
                "company_id": data.get('company_id', ''),
                "department": data.get('department', ''),
                "length": data.get('length', 0),
                "is_breached": data.get('is_breached', False),
                "timestamp": datetime.datetime.utcnow()
            })
        except Exception:
            pass
        return {"status": "logged"}, 201