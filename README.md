# notSafe. 🛡️

> Enterprise password auditing and breach monitoring platform for SMEs.

*Titre Professionnel DWWM 2026 · IMIE Paris · Igor Luna de Oliveira*

---

## What it does

**notSafe.** helps companies move from reactive to preventive security through three tools:

- **Password Auditor** — checks passwords against 800M+ leaked credentials using the HIBP k-anonymity protocol. Only the first 5 characters of the SHA-1 hash are ever sent — the full password never leaves the browser.
- **Email Monitor** — scans corporate email addresses against dark web breach databases via XposedOrNot API.
- **Company Dashboard** — department-level risk scoring, breach trends, and a shareable employee self-audit portal.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Bootstrap 5, Chart.js, i18next (EN/FR) |
| Backend | Flask (Python 3), Flask-RESTX, Swagger/OpenAPI |
| SQL | SQLAlchemy + Flask-Migrate (PostgreSQL / SQLite) |
| NoSQL | MongoDB + PyMongo (anonymous usage logs, aggregations) |
| Auth | JWT (PyJWT, 24h), Bcrypt, Web Crypto API (client-side hashing) |
| DevOps | Docker, Docker Compose, Nginx |
| Testing | Pytest (68 tests) |

---

## Security design

| Concern | Solution |
|---------|---------|
| Password privacy | K-anonymity — only SHA-1 prefix (5 chars) sent to HIBP |
| Client-side hashing | `crypto.subtle.digest` — password never sent as plaintext |
| Auth | JWT HS256 with `@token_required` decorator |
| Password reset | Separate `type: password_reset` token — cannot access dashboard |
| XSS | HTML tag stripping + `html.escape()` on all user input |
| SQL injection | SQLAlchemy ORM — no raw queries |
| Rate limiting | Flask-Limiter (60/min HIBP, 10/min email scan) |
| Company isolation | All queries scoped to `current_user.company_id` |
| Anti-enumeration | `forgot-password` always returns 200 |

---

## Project structure

```
notSafe/
├── backend/
│   ├── app/
│   │   ├── controllers/    # auth, dashboard, public, tools
│   │   ├── models/         # Company, User, Department (SQL)
│   │   ├── services/       # AuthService, AnalyticsService
│   │   └── utils/          # @token_required decorator
│   ├── tests/              # 68 tests across 4 suites
│   ├── run.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/          # Home, Dashboard, EmailChecker...
│   │   ├── components/     # Navbar, Footer, PasswordForm
│   │   ├── context/        # ThemeContext (dark/light)
│   │   ├── hooks/          # usePasswordHasher (Web Crypto)
│   │   ├── lib/            # api.js (Axios + JWT interceptor)
│   │   └── i18n.js         # EN/FR translations
│   └── Dockerfile
├── userCase/               # UML diagrams
├── .env.example
├── .gitignore
├── .dockerignore
└── docker-compose.yml
```

---

## Quick start (Docker)

```bash
git clone https://github.com/IgorLuna10/notSafe.git
cd notSafe

cp .env.example .env
# Fill in your values in .env

docker-compose up -d --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5001 |
| Swagger UI | http://localhost:5001/docs |

---

## Tests

```bash
cd backend
pytest -v
```

| Suite | What it covers |
|-------|---------------|
| `test_unit_pure.py` | Sanitization, validators, entropy — no DB |
| `test_integration_endpoints.py` | All HTTP endpoints (SQLite in-memory, MongoDB mocked) |
| `test_security.py` | JWT attacks (expired, forged, `alg:none`), XSS, company isolation |
| `test_functional_journeys.py` | Register → Login → Dashboard, password reset, employee portal |

---

## Environment variables

Copy `.env` and fill in your values.

```env
SECRET_KEY=
DATABASE_URL=
MONGO_URI=
PORT=
ADMIN_PASSWORD=
MASTER_API_KEY=
RAPID_AI_KEY=
VITE_API_KEY=
```

---

## Author

**Igor Luna de Oliveira** — Candidat DWWM · Session Mai 2026 · IMIE Paris
