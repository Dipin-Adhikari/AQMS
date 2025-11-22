from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "aqms_db"

# Sensors (existing data)
SENSOR_COLLECTION = "aqms_full_data"
# Users (for authentication/admin panel)
USERS_COLLECTION = "users"
# Alerts (for notifications/future features)
ALERTS_COLLECTION = "alerts"

client = None
db = None

async def connect():
    global client, db
    try:
        print("Connecting to MongoDB...")
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        await db.command("ping")
        print("MongoDB connected successfully!")
    except Exception as e:
        print("MongoDB connection failed:", e)

async def close():
    global client
    if client:
        client.close()

def get_sensor_collection():
    """Returns the sensor data collection (original)"""
    return db[SENSOR_COLLECTION]

def get_users_collection():
    """Returns the users collection (for auth/admin)"""
    return db[USERS_COLLECTION]

def get_alerts_collection():
    """Returns the alerts collection (for alerts/notifications)"""
    return db[ALERTS_COLLECTION]
