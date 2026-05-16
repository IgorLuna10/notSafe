"""
test_integration_endpoints.py
Tests d'intégration — requêtes HTTP réelles via le client de test Flask.
Base SQL SQLite en mémoire. MongoDB mocké.
"""
import json
import pytest
from unittest.mock import patch, MagicMock


def register(client, name="TestCorp", email="admin@test.com", password="Password123!"):
    return client.post("/api/v1/auth/register", json={
        "name": name, "email": email, "password": password
    })


def login(client, email="admin@test.com", password="Password123!"):
    res = client.post("/api/v1/auth/login", json={
        "email": email, "password": password
    })
    return json.loads(res.data).get("token")


def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ── Auth ──────────────────────────────────────────────────────────────────

def test_register_success(client):
    res = register(client)
    assert res.status_code == 201
    assert "company_id" in json.loads(res.data)


def test_register_duplicate_email(client):
    register(client, email="dupe@test.com")
    res = register(client, email="dupe@test.com")
    assert res.status_code == 400


def test_login_success(client):
    register(client)
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com", "password": "Password123!"
    })
    assert res.status_code == 200
    data = json.loads(res.data)
    assert "token" in data
    assert "role" in data


def test_login_wrong_password(client):
    register(client)
    res = client.post("/api/v1/auth/login", json={
        "email": "admin@test.com", "password": "WRONG"
    })
    assert res.status_code == 401


def test_forgot_password_always_200(client):
    # Inconnu
    res1 = client.post("/api/v1/auth/forgot-password", json={"email": "ghost@test.com"})
    # Connu
    register(client)
    res2 = client.post("/api/v1/auth/forgot-password", json={"email": "admin@test.com"})
    assert res1.status_code == 200
    assert res2.status_code == 200


# ── Dashboard (routes protégées) ──────────────────────────────────────────

def test_analytics_without_token(client):
    res = client.get("/api/v1/dashboard/analytics")
    assert res.status_code == 401


def test_analytics_with_invalid_token(client):
    res = client.get("/api/v1/dashboard/analytics",
                     headers={"Authorization": "Bearer invalid.token.here"})
    assert res.status_code == 401


def test_analytics_with_valid_token(client):
    register(client)
    token = login(client)
    res = client.get("/api/v1/dashboard/analytics", headers=auth(token))
    assert res.status_code == 200
    data = json.loads(res.data)
    assert "company_name" in data
    assert "departments" in data


def test_add_department(client):
    register(client)
    token = login(client)
    res = client.post("/api/v1/dashboard/company/departments",
                      json={"name": "Design"}, headers=auth(token))
    assert res.status_code == 201


def test_add_department_xss_rejected(client):
    register(client)
    token = login(client)
    res = client.post("/api/v1/dashboard/company/departments",
                      json={"name": "<script>alert(1)</script>"}, headers=auth(token))
    assert res.status_code == 400


def test_add_department_duplicate(client):
    register(client)
    token = login(client)
    client.post("/api/v1/dashboard/company/departments",
                json={"name": "Finance"}, headers=auth(token))
    res = client.post("/api/v1/dashboard/company/departments",
                      json={"name": "Finance"}, headers=auth(token))
    assert res.status_code == 409


def test_delete_department(client):
    register(client)
    token = login(client)
    client.post("/api/v1/dashboard/company/departments",
                json={"name": "Temp"}, headers=auth(token))
    res = client.delete("/api/v1/dashboard/company/departments",
                        json={"name": "Temp"}, headers=auth(token))
    assert res.status_code == 200


# ── Tools ─────────────────────────────────────────────────────────────────

def test_log_check_mongodb(client):
    res = client.post("/api/v1/log-check", json={
        "length": 12, "is_breached": False
    })
    assert res.status_code == 201


def test_log_dept_check(client):
    res = client.post("/api/v1/log-dept-check", json={
        "company_id": "fake-id", "department": "HR",
        "length": 10, "is_breached": True
    })
    assert res.status_code == 201


def test_check_prefix_invalid(client):
    for bad in ["ABC", "ABCDEF", "GGGG1"]:
        res = client.get(f"/api/v1/check-prefix/{bad}")
        assert res.status_code == 400


def test_check_prefix_valid(client):
    with patch("requests.get") as mock_get:
        mock_get.return_value = MagicMock(
            status_code=200, text="AABBCC:3\nDDEEFF:1"
        )
        mock_get.return_value.raise_for_status = MagicMock()
        res = client.get("/api/v1/check-prefix/ABCDE")
    assert res.status_code == 200
    assert "suffixes" in json.loads(res.data)
