"""
test_functional_journeys.py
Scénarios utilisateur complets de bout en bout.
"""
import json
import pytest
from unittest.mock import patch, MagicMock


def register(client, name="Corp", email="admin@corp.com", password="Pass1234!"):
    return client.post("/api/v1/auth/register", json={
        "name": name, "email": email, "password": password
    })


def login(client, email="admin@corp.com", password="Pass1234!"):
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return json.loads(res.data).get("token")


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── Journey 1 : Inscription → Connexion → Dashboard ──────────────────────

def test_register_login_dashboard(client, app):
    # Inscription
    reg = register(client)
    assert reg.status_code == 201

    # Connexion
    token = login(client)
    assert token is not None

    # Dashboard
    res = client.get("/api/v1/dashboard/analytics", headers=auth(token))
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["company_name"] == "Corp"
    assert len(data["departments"]) == 10


# ── Journey 2 : Gestion des départements ─────────────────────────────────

def test_add_verify_delete_department(client, app):
    register(client)
    token = login(client)
    headers = auth(token)

    # Ajout
    client.post("/api/v1/dashboard/company/departments",
                json={"name": "Vigilance"}, headers=headers)

    # Vérification
    res = client.get("/api/v1/dashboard/analytics", headers=headers)
    assert "Vigilance" in json.loads(res.data)["departments"]

    # Suppression
    client.delete("/api/v1/dashboard/company/departments",
                  json={"name": "Vigilance"}, headers=headers)

    # Confirmation suppression
    res2 = client.get("/api/v1/dashboard/analytics", headers=headers)
    assert "Vigilance" not in json.loads(res2.data)["departments"]


# ── Journey 3 : Reset mot de passe ───────────────────────────────────────

def test_password_reset_flow(client, app):
    register(client)

    # Génération du token de reset
    with app.app_context():
        from backend.app.services.auth_service import AuthService
        token = AuthService.create_reset_token("admin@corp.com")

    assert token is not None

    # Reset avec nouveau mot de passe
    res = client.post("/api/v1/auth/reset-password", json={
        "token": token, "password": "NewPassword99!"
    })
    assert res.status_code == 200

    # Connexion avec nouveau mot de passe
    new_login = client.post("/api/v1/auth/login", json={
        "email": "admin@corp.com", "password": "NewPassword99!"
    })
    assert new_login.status_code == 200

    # Ancien mot de passe ne fonctionne plus
    old_login = client.post("/api/v1/auth/login", json={
        "email": "admin@corp.com", "password": "Pass1234!"
    })
    assert old_login.status_code == 401


# ── Journey 4 : Portail employé ──────────────────────────────────────────

def test_employee_portal_flow(client, app):
    reg = register(client, name="Umbrella")
    company_id = json.loads(reg.data)["company_id"]

    # Portail public accessible
    portal = client.get(f"/api/v1/public/company/{company_id}")
    assert portal.status_code == 200
    data = json.loads(portal.data)
    assert data["name"] == "Umbrella"
    assert "HR" in data["departments"]

    # Log anonyme
    log = client.post("/api/v1/log-dept-check", json={
        "company_id": company_id, "department": "HR",
        "length": 12, "is_breached": False
    })
    assert log.status_code == 201
