# notSafe. | Enterprise Security Mission Control

![Status](https://img.shields.io/badge/STATUS-WORK_IN_PROGRESS-orange?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker)
![Stack](https://img.shields.io/badge/MERN-ish-green?style=for-the-badge)

> **WORK IN PROGRESS:** This project is currently under active development. Some features (like Email Breach Scanning) are planned but not yet implemented.

**notSafe.** is a real-time password intelligence platform designed to move beyond simple "strength meters." It combines a public-facing password auditor with a private, multi-tenant "Mission Control" dashboard for enterprise security teams.
 
---

## 🏗 Architecture

The project is built as a decoupled **SaaS** application using a modern containerized stack:

* **Frontend:** React (Vite) + TailwindCSS + Chart.js
* **Backend:** Python (Flask) + Flask-RESTx (Swagger UI)
* **Database:** MongoDB (NoSQL)
* **Infrastructure:** Docker Compose (Nginx as Reverse Proxy)

---

## 🚀 Getting Started

Since the project is Dockerized, you can spin up the entire stack (Database, Backend, Frontend) with one command.

### Prerequisites
* Docker Desktop installed
* Git

### Installation
1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/notSafe.git](https://github.com/yourusername/notSafe.git)
    cd notSafe
    ```

2.  **Create Environment Variables**
    Create a `.env` file in the root directory (or rename `.env.example`):
    ```env
    MONGO_URI=mongodb://mongo:27017/notsafe
    SECRET_KEY=super_secret_dev_key_123
    MASTER_API_KEY=notsafe_dev_12345
    ADMIN_PASSWORD=admin
    ```

3.  **Run with Docker**
    ```bash
    docker compose up --build
    ```

4.  **Access the App**
    * **Frontend (App):** [http://localhost:5173](http://localhost:5173)
    * **Backend (Developer Gateway):** [http://localhost:5001](http://localhost:5001)
    * **API Docs (Swagger):** [http://localhost:5001/api/docs](http://localhost:5001/api/docs)

---

## ✅ Project Status

| Feature | Status | Description |
| :--- | :---: | :--- |
| **Dockerization** | [X] Done | Full stack runs via `docker compose` |
| **Password Auditor** | [] Done | Real-time HIBP (Pwned Passwords) check via API |
| **Company Auth** | [] Done | Registration & Login (JWT/Session based) |
| **Mission Control** | [] Done | Real-time Charts (Safety Ratio, Trends) |
| **CSV Export** | [] Done | Generate Audit Logs for Compliance |
| **Email Scanner** | [] Done | Check if email addresses were in breaches |
| **Magic Links** | [] Planned | Send anonymous audit links to employees |
| **Campaign Manager** | [] Planned | Group audits by Quarter/Year |

---

## 📂 Project Structure

```text
notSafe/
├── backend/
│   ├── app/
│   │   ├── routes.py       # API Endpoints & Logic
│   │   ├── models.py       # MongoDB Schemas
│   │   └── templates/      # Dev Portal & Swagger HTML
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # React Views (Home, Login, Dashboard)
│   │   └── App.jsx         # Router Logic
│   ├── Dockerfile
│   └── nginx.conf          # Reverse Proxy Config
├── docker-compose.yml      # Orchestration
└── README.md
