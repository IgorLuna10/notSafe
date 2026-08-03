"""
test_unit_pure.py
Tests unitaires sur les fonctions pures de notSafe.
Aucune base de données, aucun serveur, aucune dépendance externe.
"""
import re
import html
import pytest

# ── Fonctions testées (copiées exactement depuis le code source) ──────────

_TAG_RE = re.compile(r'<[^>]+>')

def sanitize_name(value: str) -> str:
    stripped = _TAG_RE.sub('', value)
    return html.escape(stripped).strip()

def is_valid_prefix(prefix: str) -> bool:
    return bool(re.match(r'^[a-fA-F0-9]{5}$', prefix))

def is_valid_email(email: str) -> bool:
    return bool(re.match(r"[^@]+@[^@]+\.[^@]+", email))

def is_valid_dept_name(name: str) -> bool:
    return bool(re.match(r"^[\w\s\-&']+$", name))


# ── 1. sanitize_name ──────────────────────────────────────────────────────

@pytest.mark.parametrize("input_val, expected", [
    ("Finance",              "Finance"),
    ("  HR  ",               "HR"),
    ("IT-Security",          "IT-Security"),
    ("R&D",                  "R&amp;D"),
    ("",                     ""),
])
def test_sanitize_name_valid(input_val, expected):
    assert sanitize_name(input_val) == expected


@pytest.mark.parametrize("payload", [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    "<svg onload=alert(1)>",
    "<b>Finance</b>",
])
def test_sanitize_name_strips_html(payload):
    result = sanitize_name(payload)
    assert "<" not in result
    assert ">" not in result


def test_sanitize_name_keeps_text_inside_tags():
    result = sanitize_name("<b>Finance</b>")
    assert "Finance" in result


def test_sanitize_name_only_tags_returns_empty():
    assert sanitize_name("<script></script>").strip() == ""


# ── 2. is_valid_prefix (HIBP k-anonymité) ────────────────────────────────

@pytest.mark.parametrize("prefix", [
    "ABCDE", "abcde", "aB3Ff", "12345", "0A1B2",
])
def test_prefix_valid(prefix):
    assert is_valid_prefix(prefix) is True


@pytest.mark.parametrize("prefix", [
    "ABC",       # trop court
    "ABCDEF",    # trop long
    "",          # vide
    "GGGG1",     # non-hex
    "!@#$%",     # caractères spéciaux
    "ABCDZ",     # Z n'est pas hex
])
def test_prefix_invalid(prefix):
    assert is_valid_prefix(prefix) is False


# ── 3. is_valid_email ─────────────────────────────────────────────────────

@pytest.mark.parametrize("email", [
    "user@company.com",
    "admin@mail.company.com",
    "test@test.fr",
])
def test_email_valid(email):
    assert is_valid_email(email) is True


@pytest.mark.parametrize("email", [
    "notanemail",
    "@nodomain.com",
    "noatsign",
    "",
    "@",
])
def test_email_invalid(email):
    assert is_valid_email(email) is False


# ── 4. is_valid_dept_name ─────────────────────────────────────────────────

@pytest.mark.parametrize("name", [
    "Finance",
    "Human Resources",
    "IT-Security",
    "R&D",
    "CEO's Office",
])
def test_dept_name_valid(name):
    assert is_valid_dept_name(name) is True


@pytest.mark.parametrize("name", [
    "Dept;evil",
    "Dept|cmd",
    "<script>",
    "",
])
def test_dept_name_invalid(name):
    assert is_valid_dept_name(name) is False
