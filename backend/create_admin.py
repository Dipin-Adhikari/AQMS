from database import connect, get_users_collection
from auth import get_password_hash
from datetime import datetime
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def create_first_admin():
    await connect()  # Ensure Mongo connection

    coll = get_users_collection()
    admin_email = os.getenv("EMAIL_ADDRESS")
    admin_username = os.getenv("USERNAME")
    admin_password = os.getenv("PASSWORD")  # CHANGE after first login!

    # Check if admin already exists
    existing_admin = await coll.find_one({"email": admin_email})
    if existing_admin:
        print("Admin already exists!")
        return

    admin = {
        "email": admin_email,
        "username": admin_username,
        "hashed_password": get_password_hash(admin_password),
        "role": "admin",
        "created_at": datetime.utcnow()
    }

    result = await coll.insert_one(admin)
    print(f"Admin user created with ID: {result.inserted_id}")
    print("Email:", admin_email)
    print("Password:", admin_password)
    print("IMPORTANT: Change this password after first login!")

if __name__ == "__main__":
    asyncio.run(create_first_admin())
