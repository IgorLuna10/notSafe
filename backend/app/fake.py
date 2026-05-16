from app import create_app, mongo, bcrypt
import datetime
import random
import uuid


# Initialize the app context so we can talk to the DB
app = create_app()

def seed():
    with app.app_context():
        print ("SEEDING DB")

    # 1. START FRESH
    mongo.db.users.delete_many({})
    mongo.db.companies.delete_many({})
    mongo.db.checks.delete_many({})

    #2 . CREATE DEMO
    company_id = str(uuid.uuid4())
    departments = ["Barista", "Roasting", "Farmer", "Marketing", "Sales", "Director", "Humain Resources"]

    print(f"Creating Company: L'Arbre à Café (ID: {company_id})")
    mongo.db.companies.insert_one({
        "id": company_id,
        "name": "L'Arbre à Café",
        "owner_email": "admin@cafe.fr",
        "created_at": datetime.datetime.now(),
        "departments": departments
        })
    
    #3 . CREATE ADMIN

    hashed_pw = bcrypt.generate_password_hash("password").decode('utf-8')
    mongo.db.users.insert_one({
        "id": str(uuid.uuid4()),
        "email": "admin@cafe.fr",
        "password": hashed_pw,
        "company_id": company_id,
        "is_admin": True

    })

    # 4. GENRATING TRAFFIC DATA 30 DAYS +
    print ("Generating 500 simulated security checks")
    checks = []
    base_time = datetime.datetime.now()

    for i in range(500):

        dept = random.choice(departments)
        days_ago = random.randint(0, 30)
        timestamp = base_time - datetime.timedelta(days=days_ago, hours = random.randint(0, 23))

        is_breached = random.choice ([True, False, False, False, False, False])

        checks.append({
            "type": "dept_check",
            "company_id": company_id,
            "department": dept,
            "length": random.randint(8, 16),
            "is_breached": is_breached,
            "timestamp": timestamp
            })
        
        mongo.db.checks.insert_many(checks)
        print("DATABASE SEEDED! Login with admin@cafe.fr / password")

        if __name__ == "__main__":
            seed()