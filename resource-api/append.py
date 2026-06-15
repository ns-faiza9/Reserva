from fastapi import FastAPI, Depends, Request, HTTPException
from pydantic import BaseModel
from bson import ObjectId
import pymongo
import os

app = FastAPI()

mongo_uri = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
client = pymongo.MongoClient(mongo_uri)
db = client["reservaDB"]
resources_collection = db["resources"]

def verify_token(request: Request) -> dict:
    token = request.headers.get("Token")
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
    # Stub for token decoding. You can implement proper JWT decoding here.
    return {"sub": "user@example.com"}

class CatalogResourceRequest(BaseModel):
    catalogId: int
    name: str
    type: str
    location: str
    capacity: int

@app.post("/api/resources/from-catalog")
def ensure_catalog_resource(request: CatalogResourceRequest, payload: dict = Depends(verify_token)):
    resource = resources_collection.find_one({"id": request.catalogId})
    if not resource:
        resource = {
            "id": request.catalogId,
            "name": request.name,
            "type": request.type,
            "location": request.location,
            "capacity": request.capacity,
            "available": True
        }
        res = resources_collection.insert_one(resource)
        resource["_id"] = str(res.inserted_id)
    else:
        resource["_id"] = str(resource["_id"])
    return resource

@app.get("/api/resources/categories")
def get_categories():
    categories = resources_collection.distinct("type")
    return categories

@app.get("/api/resources/search")
def search_resources(q: str, date: str = None, availableOnly: bool = False, payload: dict = Depends(verify_token)):
    query = {"$or": [{"name": {"$regex": q, "$options": "i"}}, {"type": {"$regex": q, "$options": "i"}}, {"location": {"$regex": q, "$options": "i"}}]}
    if availableOnly:
        query["available"] = True
    resources = list(resources_collection.find(query))
    for r in resources:
        r["_id"] = str(r["_id"])
    return resources

@app.get("/api/resources/recommendations")
def recommendations(date: str = None, payload: dict = Depends(verify_token)):
    resources = list(resources_collection.find({"available": True}).limit(5))
    for r in resources:
        r["_id"] = str(r["_id"])
    return resources

@app.get("/api/time-slots")
def get_time_slots(resourceId: int, date: str):
    return [
        {"id": 1, "startTime": "09:00", "endTime": "10:00", "status": "AVAILABLE"},
        {"id": 2, "startTime": "10:00", "endTime": "11:00", "status": "AVAILABLE"},
        {"id": 3, "startTime": "11:00", "endTime": "12:00", "status": "AVAILABLE"},
    ]

bookings_collection = db["bookings"]

class BookingRequest(BaseModel):
    resourceId: int | str
    fromDate: str
    toDate: str
    fromTime: str
    toTime: str
    purpose: str

@app.post("/api/bookings")
def create_booking(request: BookingRequest, payload: dict = Depends(verify_token)):
    booking = request.model_dump()
    booking["userEmail"] = payload.get("sub")
    res = bookings_collection.insert_one(booking)
    booking["_id"] = str(res.inserted_id)
    return booking

@app.get("/api/bookings")
def get_bookings(payload: dict = Depends(verify_token)):
    email = payload.get("sub")
    bookings = list(bookings_collection.find({"userEmail": email}))
    for b in bookings:
        b["_id"] = str(b["_id"])
        rid = b.get("resourceId")
        try:
            rid = int(rid)
            r = resources_collection.find_one({"id": rid})
        except (ValueError, TypeError):
            if ObjectId.is_valid(rid):
                r = resources_collection.find_one({"_id": ObjectId(rid)})
            else:
                r = None
        if r:
            r["_id"] = str(r["_id"])
            b["resource"] = r
    return bookings

@app.delete("/api/bookings/{id}")
def delete_booking(id: str, payload: dict = Depends(verify_token)):
    bookings_collection.delete_one({"_id": ObjectId(id)})
    return {"status": "success"}

@app.post("/api/resources")
def create_resource(data: dict, payload: dict = Depends(verify_token)):
    res = resources_collection.insert_one(data)
    data["_id"] = str(res.inserted_id)
    return data

@app.put("/api/resources/{id}")
def update_resource(id: str, data: dict, payload: dict = Depends(verify_token)):
    resources_collection.update_one({"_id": ObjectId(id)}, {"$set": data})
    return {"status": "updated"}

@app.delete("/api/resources/{id}")
def delete_resource(id: str, payload: dict = Depends(verify_token)):
    resources_collection.delete_one({"_id": ObjectId(id)})
    return {"status": "deleted"}
