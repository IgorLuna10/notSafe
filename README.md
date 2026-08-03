# notSafe. 🛡️

**Plateforme d'audit de sécurité et de surveillance des fuites de données.**  
*Projet certifiant - Titre Professionnel DWWM 2026*

---

## 📝 Présentation du projet
`notSafe.` est une solution SaaS Full-Stack conçue pour aider les PME à passer d'une sécurité subie à une culture de la prévention. L'application permet d'auditer la force des mots de passe sans jamais les stocker et de surveiller l'exposition des emails sur le Dark Web.

### Points clés :
- **Privacy by Design :** Utilisation du protocole de k-anonymité pour l'audit HIBP.
- **Architecture Hybride :** SQL (PostgreSQL) pour les données métier et NoSQL (MongoDB) pour les logs analytiques.
- **Documentation Vivante :** API documentée via Swagger/OpenAPI.

---

## 🚀 Installation (Docker)
Le projet est entièrement conteneurisé. Pour le lancer en une seule commande :

1. **Cloner le dépôt**
2. **Configurer l'environnement :**
   ```bash
   cp backend/.env.example backend/.env
   ```
3. **Lancer les conteneurs :**
   ```bash
   docker-compose up -d --build
   ```
L'application sera accessible sur :
- **Frontend :** `http://localhost:5173`
- **Backend API :** `http://localhost:5001`
- **Swagger UI :** `http://localhost:5001/docs`

---

## 🛠️ Stack Technique
- **Frontend :** React 18, Vite, Bootstrap 5, Chart.js.
- **Backend :** Flask (Python 3), Flask-RESTX (Swagger), Flask-Migrate.
- **Bases de données :** SQLAlchemy (SQL) + PyMongo (NoSQL).
- **Sécurité :** JWT (Authentication), Bcrypt (Hashing), Web Crypto API (Client-side).

---

## 🧪 Tests & Validation
Le projet inclut une suite de tests complète (68 tests) couvrant l'unité, l'intégration, le fonctionnel et la sécurité.

Pour exécuter les tests :
```bash
cd backend
pytest
```

---

## 🇬🇧 Technical Overview (English)
`notSafe.` is a security-focused SaaS application.
- **Core Feature:** Password auditor using **k-anonymity** protocol (only the first 5 chars of SHA-1 hash are sent to HIBP API).
- **Backend:** Robust REST API built with Flask, featuring defensive programming and input sanitization.
- **Persistence:** Hybrid strategy using relational DB for structured data and NoSQL for high-volume anonymous logs.
- **Deployment:** Fully orchestrated with Docker Compose for environment isomorphism.

---

## 👨‍💻 Auteur
**Igor Luna de Oliveira**  
*Candidat au Titre Professionnel Développeur Web et Web Mobile*  
*Session Mai 2026 - IMIE Paris*
