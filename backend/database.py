# database.py
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "aqms_db"
COLLECTION_NAME = "aqms_full_data"

client = None
db = None

async def connect():
    global client, db
    try:
        print("Connecting to MongoDB...")
        client = AsyncIOMotorClient(MONGO_URL)
        db = client[DB_NAME]
        # simple test ping
        await db.command("ping")
        print("MongoDB connected successfully!")
    except Exception as e:
        print("MongoDB connection failed:", e)


async def close():
    global client
    if client:
        client.close()

def get_collection():
    return db[COLLECTION_NAME]
