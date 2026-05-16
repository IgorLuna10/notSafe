"""
test_security.py
Tests de sécurité — scénarios d'attaque sur l'API notSafe.
"""
import json
import jwt
import datetime
import base64
import pytest

SECRET = "test_secret_key_notSafe"


def register(client, name="SecCorp", email="admin@sec.com", password="SecPass1!"):
    return client.post("/api/v1/auth/register", json={
        "name": name, "email": email, "password": password
    })


def login(client, email="admin@sec.com", password="SecPass1!"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return json.loads(res.data).get("token")


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── 1. Accès sans token ───────────────────────────────────────────────────

def test_no_token_returns_401(client):
    res = client.get("/api/v1/dashboard/analytics")
    assert res.status_code == 401


# ── 2. Token expiré ───────────────────────────────────────────────────────

def test_expired_token_returns_401(client):
    expired = jwt.encode(
        {"user_id": "fake", "exp": datetime.datetime.utcnow() - datetime.timedelta(hours=1)},
        SECRET, algorithm="HS256"
    )
    res = client.get("/api/v1/dashboard/analytics", headers=auth(expired))
    assert res.status_code == 401


# ── 3. Token forgé (mauvaise clé) ────────────────────────────────────────

def test_forged_token_returns_401(client):
    forged = jwt.encode(
        {"user_id": "attacker", "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
        "wrong_secret_key", algorithm="HS256"
    )
    res = client.get("/api/v1/dashboard/analytics", headers=auth(forged))
    assert res.status_code == 401


# ── 4. Attaque alg:none ───────────────────────────────────────────────────

def test_alg_none_attack_returns_401(client):
    header = base64.b64encode(b'{"alg":"none","typ":"JWT"}').decode().rstrip("=")
    payload = base64.b64encode(
        json.dumps({"user_id": "attacker", "exp": 9999999999}).encode()
    ).decode().rstrip("=")
    none_token = f"{header}.{payload}."
    res = client.get("/api/v1/dashboard/analytics", headers=auth(none_token))
    assert res.status_code == 401


# ── 5. XSS dans le nom de département ────────────────────────────────────

@pytest.mark.parametrize("payload", [
    "<script>alert('xss')</script>",
    "<img src=x onerror=alert(1)>",
    "<svg onload=alert(1)>",
])
def test_xss_department_rejected(client, payload):
    register(client)
    token = login(client)
    res = client.post("/api/v1/dashboard/company/departments",
                      json={"name": payload}, headers=auth(token))
    assert res.status_code == 400


# ── 6. Isolation inter-entreprises ───────────────────────────────────────

def test_company_isolation(client):
    # Entreprise A
    client.post("/api/v1/auth/register", json={
        "name": "Company A", "email": "a@company-a.com", "password": "PassA1234!"
    })
    login_a = client.post("/api/v1/auth/login", json={
        "email": "a@company-a.com", "password": "PassA1234!"
    })
    token_a = json.loads(login_a.data)["token"]

    # Entreprise B ajoute un département secret
    client.post("/api/v1/auth/register", json={
        "name": "Company B", "email": "b@company-b.com", "password": "PassB5678!"
    })
    login_b = client.post("/api/v1/auth/login", json={
        "email": "b@company-b.com", "password": "PassB5678!"
    })
    token_b = json.loads(login_b.data)["token"]
    client.post("/api/v1/dashboard/company/departments",
                json={"name": "TopSecret"}, headers=auth(token_b))

    # Company A ne doit pas voir les données de Company B
    res = client.get("/api/v1/dashboard/analytics", headers=auth(token_a))
    data = json.loads(res.data)
    assert data["company_name"] == "Company A"
    assert "TopSecret" not in data["departments"]


# ── 7. Token reset utilisé comme token de connexion ──────────────────────

def test_reset_token_cannot_access_dashboard(client, app):
    client.post("/api/v1/auth/register", json={
        "name": "Corp", "email": "user@corp.com", "password": "Pass1234!"
    })
    with app.app_context():
        from app.services.auth_service import AuthService
        reset_token = AuthService.create_reset_token("user@corp.com")

    res = client.get("/api/v1/dashboard/analytics", headers=auth(reset_token))
    assert res.status_code == 401
