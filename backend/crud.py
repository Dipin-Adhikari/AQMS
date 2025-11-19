# crud.py
from bson import ObjectId
from typing import List
import schemas, database

def _doc_to_resp(doc: dict) -> dict:
    """Convert MongoDB document to API response."""
    if not doc:
        return None

    doc = dict(doc)
    _id = doc.pop("_id", None)
    doc["id"] = str(_id) if _id else None
    return doc

async def create_full_data(data: schemas.AQMSFullDataCreate) -> dict:
    coll = database.get_collection()
    payload = data.dict()
    result = await coll.insert_one(payload)

    inserted = await coll.find_one({"_id": result.inserted_id})
    return _doc_to_resp(inserted)

async def get_all_full_data(limit: int = 3000) -> List[dict]:
    coll = database.get_collection()
    cursor = coll.find().sort("ts", -1).limit(limit)

    docs = []
    async for doc in cursor:
        docs.append(_doc_to_resp(doc))

    return docs
