from bson import ObjectId
from typing import List, Optional
import schemas
import database
from auth import get_password_hash

# ------------------ Sensor Data Logic ------------------ #

def _doc_to_resp(doc: dict) -> Optional[dict]:
    """Convert MongoDB document to API response."""
    if not doc:
        return None
    doc = dict(doc)
    _id = doc.pop("_id", None)
    doc["id"] = str(_id) if _id else None
    return doc

async def create_full_data(data: schemas.AQMSFullDataCreate) -> dict:
    coll = database.get_sensor_collection()
    payload = data.dict()
    result = await coll.insert_one(payload)
    inserted = await coll.find_one({"_id": result.inserted_id})
    return _doc_to_resp(inserted)

async def get_all_full_data(limit: int = 3000) -> List[dict]:
    coll = database.get_sensor_collection()
    cursor = coll.find().sort("ts", -1).limit(limit)
    docs = []
    async for doc in cursor:
        docs.append(_doc_to_resp(doc))
    return docs

# ------------------ User CRUD for Authentication/Admin ------------------ #

async def create_user(user: schemas.UserCreate):
    coll = database.get_users_collection()
    user_dict = {
        "email": user.email.lower(),
        "username": user.username,
        "hashed_password": get_password_hash(user.password),
        "role": user.role,
        "created_at": user.created_at if hasattr(user, "created_at") else None
    }
    result = await coll.insert_one(user_dict)
    return result.inserted_id

async def get_user_by_email(email: str) -> Optional[dict]:
    coll = database.get_users_collection()
    user = await coll.find_one({"email": email.lower()})
    return _doc_to_resp(user)

async def get_user_by_id(user_id: str) -> Optional[dict]:
    coll = database.get_users_collection()
    user = await coll.find_one({"_id": ObjectId(user_id)})
    return _doc_to_resp(user)

async def list_users(limit: int = 100) -> List[dict]:
    coll = database.get_users_collection()
    cursor = coll.find().limit(limit)
    users = []
    async for user in cursor:
        users.append(_doc_to_resp(user))
    return users


async def get_full_data_after_timestamp(cutoff_ts: int, limit: int = 3000) -> List[dict]:
    """
    Get all sensor data readings with timestamp >= cutoff_ts (ascending order).
    """
    coll = database.get_sensor_collection()
    cursor = coll.find({"ts": {"$gte": cutoff_ts}}).sort("ts", 1).limit(limit)
    docs = []
    async for doc in cursor:
        docs.append(_doc_to_resp(doc))
    return docs
