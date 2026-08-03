# notSafe

notSafe is an audit and leak monitoring platform. It is a full-stack project built for the DWWM qualification.

## Features

- **Password Audit**: Checks password database lists using k-anonymity protocol via the HIBP API.
- **Database Architecture**: Implements PostgreSQL for structured data and MongoDB for logs.
- **API Documentation**: Uses Swagger and OpenAPI specifications.
- **Tests**: Contains unit, integration, and security tests.

## Tech Stack

- **Frontend**: React 18, Vite, Bootstrap 5, Chart.js
- **Backend**: Flask (Python 3), Flask-RESTX, Flask-Migrate
- **ORM**: SQLAlchemy
- **Database Drivers**: PyMongo
- **Authentication**: JWT, Bcrypt, Web Crypto API
- **Deployment**: Docker Compose

## Execution

```bash
cp backend/.env.example backend/.env
docker-compose up -d --build
```
