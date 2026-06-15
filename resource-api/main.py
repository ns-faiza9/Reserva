import hashlib
import hmac
import math
import os
import re
import secrets
from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from pydantic import BaseModel
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

app = FastAPI()

# MongoDB setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["reservaDB"]
resources_collection = db["resources"]
bookings_collection = db["bookings"]
usage_logs_collection = db["usage_logs"]
resource_embeddings_collection = db["resource_embeddings"]
booking_history_collection = db["booking_history"]
users_collection = db["users"]

bookings_collection.create_index([("resourceId", 1), ("fromDate", 1), ("toDate", 1), ("status", 1)])
usage_logs_collection.create_index([("userEmail", 1), ("createdAt", -1)])
resource_embeddings_collection.create_index("resourceKey", unique=True)
booking_history_collection.create_index([("userEmail", 1), ("createdAt", -1)])
users_collection.create_index("email", unique=True)
users_collection.create_index("username", unique=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "super_secret_jwt_key_for_final_project"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120
VECTOR_DIMENSIONS = 96

DEFAULT_TIME_SLOTS = [
    ("09:00", "10:00"),
    ("10:00", "11:00"),
    ("11:00", "12:00"),
    ("12:00", "13:00"),
    ("13:00", "14:00"),
    ("14:00", "15:00"),
    ("15:00", "16:00"),
    ("16:00", "17:00"),
]

SEMANTIC_SYNONYMS = {
    "meeting": ["meeting", "conference", "boardroom", "room", "discussion", "seminar"],
    "meetings": ["meeting", "conference", "boardroom", "room"],
    "room": ["room", "space", "venue", "hall", "suite"],
    "rooms": ["room", "space", "venue", "hall", "suite"],
    "projector": ["projector", "presentation", "display", "screen", "conference"],
    "presentation": ["projector", "presentation", "display", "screen"],
    "lab": ["lab", "laboratory", "computer", "systems", "workstation"],
    "laboratory": ["lab", "laboratory", "computer", "systems"],
    "gpu": ["gpu", "graphics", "cuda", "lab", "workstation", "systems"],
    "systems": ["systems", "computer", "workstation", "lab"],
    "equipment": ["equipment", "device", "hardware", "gear"],
    "available": ["available", "free", "open"],
    "free": ["available", "free", "open"],
    "hall": ["hall", "auditorium", "conference", "venue"],
}


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    fullname: str | None = None
    email: str
    username: str | None = None
    password: str
    phone: str | None = None
    role: str | int = "USER"


class CatalogResourceRequest(BaseModel):
    catalogId: int
    name: str
    type: str
    location: str
    capacity: int


class BookingRequest(BaseModel):
    resourceId: int | str
    fromDate: str
    toDate: str
    fromTime: str
    toTime: str
    purpose: str


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# The frontend passes token via custom header "Token"
def verify_token(token: str = Header(None, alias="Token")):
    if not token:
        raise HTTPException(status_code=401, detail="Token missing")
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_admin(payload: dict = Depends(verify_token)):
    if payload.get("role") != 2:
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload


def utcnow():
    return datetime.utcnow()


def normalize_role(role: str | int):
    if isinstance(role, int):
        return 2 if role == 2 else 1
    return 2 if str(role).strip().upper() == "ADMIN" else 1


def role_label(role: int):
    return "ADMIN" if role == 2 else "USER"


def hash_password(password: str):
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str):
    try:
        salt, digest = stored_hash.split("$", 1)
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000).hex()
    return hmac.compare_digest(candidate, digest)


def serialize_doc(doc: dict | None):
    if not doc:
        return None
    serialized = dict(doc)
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])
    return serialized


def resource_key(resource: dict):
    if resource.get("id") is not None:
        return str(resource["id"])
    return str(resource["_id"])


def resource_aliases(resource: dict):
    aliases = {str(resource["_id"])}
    if resource.get("id") is not None:
        aliases.add(resource["id"])
        aliases.add(str(resource["id"]))
    return list(aliases)


def find_resource(resource_id: int | str):
    if isinstance(resource_id, int):
        resource = resources_collection.find_one({"id": resource_id})
        if resource:
            return resource

    text_id = str(resource_id)
    if text_id.isdigit():
        resource = resources_collection.find_one({"id": int(text_id)})
        if resource:
            return resource

    if ObjectId.is_valid(text_id):
        return resources_collection.find_one({"_id": ObjectId(text_id)})

    return None


def parse_interval(from_date: str, from_time: str, to_date: str, to_time: str):
    try:
        start = datetime.fromisoformat(f"{from_date}T{from_time}")
        end = datetime.fromisoformat(f"{to_date}T{to_time}")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid booking date or time")

    if end <= start:
        raise HTTPException(status_code=400, detail='"To" date/time must be after "From" date/time')
    return start, end


def intervals_overlap(start_a: datetime, end_a: datetime, start_b: datetime, end_b: datetime):
    return start_a < end_b and start_b < end_a


def active_bookings_for_resource(resource: dict):
    return list(
        bookings_collection.find(
            {
                "resourceId": {"$in": resource_aliases(resource)},
                "status": {"$ne": "CANCELLED"},
            }
        )
    )


def has_conflict(resource: dict, start: datetime, end: datetime):
    for booking in active_bookings_for_resource(resource):
        try:
            existing_start, existing_end = parse_interval(
                booking["fromDate"],
                booking["fromTime"],
                booking["toDate"],
                booking["toTime"],
            )
        except HTTPException:
            continue
        if intervals_overlap(start, end, existing_start, existing_end):
            return True
    return False


def is_resource_available(resource: dict, date: str | None = None):
    if resource.get("available") is False:
        return False
    if not date:
        return True

    for index, (start_time, end_time) in enumerate(DEFAULT_TIME_SLOTS, start=1):
        slot_start, slot_end = parse_interval(date, start_time, date, end_time)
        if not has_conflict(resource, slot_start, slot_end):
            return True
    return False


def serialize_resource(resource: dict, date: str | None = None):
    serialized = serialize_doc(resource)
    if serialized and date:
        serialized["available"] = is_resource_available(resource, date)
    return serialized


def log_usage(action: str, payload: dict, user_email: str | None = None):
    usage_logs_collection.insert_one(
        {
            "action": action,
            "userEmail": user_email,
            "payload": payload,
            "createdAt": utcnow(),
        }
    )


def add_booking_history(action: str, booking: dict, user_email: str | None = None):
    booking_history_collection.insert_one(
        {
            "action": action,
            "userEmail": user_email or booking.get("userEmail"),
            "bookingId": str(booking.get("_id") or booking.get("id")),
            "resourceId": booking.get("resourceId"),
            "snapshot": serialize_doc(booking),
            "createdAt": utcnow(),
        }
    )


def tokenize(text: str):
    return re.findall(r"[a-z0-9]+", text.lower())


def expand_tokens(text: str):
    expanded = []
    for token in tokenize(text):
        expanded.append(token)
        expanded.extend(SEMANTIC_SYNONYMS.get(token, []))
    return expanded


def hashed_embedding(text: str):
    vector = [0.0] * VECTOR_DIMENSIONS
    for token in expand_tokens(text):
        digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
        index = int(digest[:8], 16) % VECTOR_DIMENSIONS
        vector[index] += 1.0

    magnitude = math.sqrt(sum(value * value for value in vector))
    if magnitude == 0:
        return vector
    return [value / magnitude for value in vector]


def cosine_similarity(left: list[float], right: list[float]):
    return sum(left_value * right_value for left_value, right_value in zip(left, right))


def resource_search_text(resource: dict):
    fields = [
        resource.get("name", ""),
        resource.get("type", ""),
        resource.get("location", ""),
        resource.get("description", ""),
    ]
    if resource.get("hasProjector"):
        fields.append("projector presentation screen display meeting conference")
    if resource.get("hasGpu"):
        fields.append("gpu graphics cuda lab computer systems workstation")
    if resource.get("available"):
        fields.append("available free open")
    return " ".join(str(field) for field in fields if field is not None)


def upsert_resource_embedding(resource: dict):
    key = resource_key(resource)
    text = resource_search_text(resource)
    resource_embeddings_collection.update_one(
        {"resourceKey": key},
        {
            "$set": {
                "resourceKey": key,
                "resourceObjectId": str(resource["_id"]),
                "numericResourceId": resource.get("id"),
                "text": text,
                "embedding": hashed_embedding(text),
                "updatedAt": utcnow(),
            }
        },
        upsert=True,
    )


def ensure_resource_embeddings(resources: list[dict]):
    for resource in resources:
        upsert_resource_embedding(resource)


def next_numeric_resource_id():
    last = resources_collection.find_one({"id": {"$type": "number"}}, sort=[("id", -1)])
    return int(last["id"]) + 1 if last and last.get("id") is not None else 1


@app.post("/authservice/signin")
def signin(data: LoginRequest):
    login_id = data.username.strip().lower()
    user = users_collection.find_one({"$or": [{"email": login_id}, {"username": login_id}]})

    if not user and login_id == "admin@reserva.com" and data.password == "admin123":
        token = create_access_token({"sub": login_id, "name": "Admin", "role": 2, "roleName": "ADMIN"})
        return {"code": 200, "jwt": token, "message": "Login successful"}

    if not user:
        return {"code": 404, "message": "Account not found. Please sign up again with this email."}

    if user and verify_password(data.password, user.get("passwordHash", "")):
        token = create_access_token(
            {
                "sub": user["email"],
                "name": user.get("fullname") or user.get("username") or user["email"].split("@")[0],
                "role": user.get("role", 1),
                "roleName": role_label(user.get("role", 1)),
            }
        )
        return {"code": 200, "jwt": token, "message": "Login successful"}

    return {"code": 401, "message": "Incorrect password for this account"}


@app.post("/authservice/signup")
def signup(data: SignupRequest):
    email = data.email.strip().lower()
    username = (data.username or email).strip().lower()
    if len(data.password) < 8:
        return {"code": 400, "message": "Password must be at least 8 characters long"}

    user = {
        "fullname": data.fullname or username,
        "email": email,
        "username": username,
        "phone": data.phone or "",
        "role": normalize_role(data.role),
        "roleName": role_label(normalize_role(data.role)),
        "passwordHash": hash_password(data.password),
        "createdAt": utcnow(),
    }

    try:
        users_collection.insert_one(user)
    except DuplicateKeyError:
        return {"code": 409, "message": "An account with this email or username already exists"}

    return {"code": 200, "message": "Signup successful"}


@app.get("/authservice/uinfo")
def get_uinfo(payload: dict = Depends(verify_token)):
    email = payload.get("sub")
    user = users_collection.find_one({"email": email}) if email else None
    name = (
        user.get("fullname")
        if user
        else payload.get("name") or payload.get("sub", "Operator").split("@")[0]
    )
    role = user.get("role", payload.get("role", 1)) if user else payload.get("role", 1)
    return {
        "code": 200,
        "email": email,
        "fullname": name,
        "name": name,
        "username": user.get("username", "") if user else "",
        "phone": user.get("phone", "") if user else "",
        "role": role,
        "roleName": user.get("roleName", role_label(role)) if user else payload.get("roleName") or role_label(role),
        "status": 1,
        "statusText": "Active",
    }


@app.get("/api/resources")
def get_resources(date: str = None, payload: dict = Depends(verify_token)):
    resources = list(resources_collection.find({}))
    ensure_resource_embeddings(resources)
    return [serialize_resource(resource, date) for resource in resources]


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
            "available": True,
        }
        result = resources_collection.insert_one(resource)
        resource["_id"] = result.inserted_id

    upsert_resource_embedding(resource)
    return serialize_resource(resource)


@app.get("/api/resources/categories")
def get_categories():
    return sorted(resources_collection.distinct("type"))


@app.get("/api/resources/search")
def search_resources(
    q: str,
    date: str = None,
    availableOnly: bool = False,
    payload: dict = Depends(verify_token),
):
    user_email = payload.get("sub")
    resources = list(resources_collection.find({}))
    ensure_resource_embeddings(resources)
    query_embedding = hashed_embedding(q)
    embeddings = {
        embedding["resourceKey"]: embedding["embedding"]
        for embedding in resource_embeddings_collection.find({})
    }

    scored_resources = []
    for resource in resources:
        if availableOnly and not is_resource_available(resource, date):
            continue
        score = cosine_similarity(query_embedding, embeddings.get(resource_key(resource), []))
        serialized = serialize_resource(resource, date)
        serialized["searchScore"] = round(score, 4)
        scored_resources.append(serialized)

    regex = re.compile(re.escape(q), re.IGNORECASE)
    scored_resources.sort(
        key=lambda item: (
            item.get("searchScore", 0),
            bool(regex.search(item.get("name", ""))),
            bool(regex.search(item.get("type", ""))),
        ),
        reverse=True,
    )
    log_usage("semantic_search", {"query": q, "date": date, "availableOnly": availableOnly}, user_email)
    return scored_resources[:25]


@app.get("/api/resources/recommendations")
def recommendations(date: str = None, payload: dict = Depends(verify_token)):
    user_email = payload.get("sub")
    resources = [resource for resource in resources_collection.find({}) if is_resource_available(resource, date)]
    ensure_resource_embeddings(resources)

    history = list(booking_history_collection.find({"userEmail": user_email}).sort("createdAt", -1).limit(5))
    if history:
        profile_text = " ".join(
            str(item.get("snapshot", {}).get(field, ""))
            for item in history
            for field in ("purpose", "resourceName", "resourceLocation")
        )
        profile_embedding = hashed_embedding(profile_text)
        embeddings = {
            embedding["resourceKey"]: embedding["embedding"]
            for embedding in resource_embeddings_collection.find({})
        }
        resources.sort(
            key=lambda resource: cosine_similarity(profile_embedding, embeddings.get(resource_key(resource), [])),
            reverse=True,
        )
    else:
        resources.sort(key=lambda resource: (resource.get("available") is True, resource.get("capacity", 0)), reverse=True)

    log_usage("recommendations", {"date": date}, user_email)
    return [serialize_resource(resource, date) for resource in resources[:5]]


@app.get("/api/time-slots")
def get_time_slots(resourceId: int | str, date: str, payload: dict = Depends(verify_token)):
    resource = find_resource(resourceId)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    slots = []
    for index, (start_time, end_time) in enumerate(DEFAULT_TIME_SLOTS, start=1):
        slot_start, slot_end = parse_interval(date, start_time, date, end_time)
        status = "BOOKED" if has_conflict(resource, slot_start, slot_end) else "AVAILABLE"
        if resource.get("available") is False:
            status = "UNAVAILABLE"
        slots.append({"id": index, "startTime": start_time, "endTime": end_time, "status": status})
    return slots


@app.post("/api/bookings")
def create_booking(request: BookingRequest, payload: dict = Depends(verify_token)):
    user_email = payload.get("sub")
    resource = find_resource(request.resourceId)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.get("available") is False:
        raise HTTPException(status_code=409, detail="Resource is currently unavailable")

    start, end = parse_interval(request.fromDate, request.fromTime, request.toDate, request.toTime)
    if has_conflict(resource, start, end):
        raise HTTPException(status_code=409, detail="This resource is already booked for the selected time")

    booking = request.model_dump()
    booking["resourceId"] = resource.get("id", str(resource["_id"]))
    booking["userEmail"] = user_email
    booking["status"] = "CONFIRMED"
    booking["createdAt"] = utcnow()
    result = bookings_collection.insert_one(booking)
    booking["_id"] = result.inserted_id
    booking["id"] = str(result.inserted_id)
    booking["resourceName"] = resource.get("name", "Unknown Resource")
    booking["resourceLocation"] = resource.get("location", "Unknown Location")

    add_booking_history("CREATED", booking, user_email)
    log_usage("booking_created", {"bookingId": booking["id"], "resourceId": booking["resourceId"]}, user_email)
    return serialize_doc(booking)


@app.get("/api/bookings")
def get_bookings(payload: dict = Depends(verify_token)):
    email = payload.get("sub")
    bookings = list(bookings_collection.find({"userEmail": email}))
    for booking in bookings:
        booking["id"] = str(booking["_id"])
        resource = find_resource(booking.get("resourceId"))
        if resource:
            booking["resourceName"] = resource.get("name", "Unknown Resource")
            booking["resourceLocation"] = resource.get("location", "Unknown Location")
        else:
            booking["resourceName"] = "Unknown Resource"
            booking["resourceLocation"] = "Unknown Location"
        if "status" not in booking:
            booking["status"] = "CONFIRMED"
    return [serialize_doc(booking) for booking in bookings]


@app.delete("/api/bookings/{id}")
def delete_booking(id: str, payload: dict = Depends(verify_token)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid booking id")

    booking = bookings_collection.find_one({"_id": ObjectId(id), "userEmail": payload.get("sub")})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    bookings_collection.update_one({"_id": ObjectId(id)}, {"$set": {"status": "CANCELLED", "cancelledAt": utcnow()}})
    booking["status"] = "CANCELLED"
    add_booking_history("CANCELLED", booking, payload.get("sub"))
    log_usage("booking_cancelled", {"bookingId": id}, payload.get("sub"))
    return {"status": "success"}


@app.post("/api/resources")
def create_resource(data: dict, payload: dict = Depends(require_admin)):
    if data.get("id") is None:
        data["id"] = next_numeric_resource_id()
    data.setdefault("available", True)
    result = resources_collection.insert_one(data)
    data["_id"] = result.inserted_id
    upsert_resource_embedding(data)
    log_usage("resource_created", {"resourceId": data["id"]}, payload.get("sub"))
    return serialize_resource(data)


@app.put("/api/resources/{id}")
def update_resource(id: str, data: dict, payload: dict = Depends(require_admin)):
    resource = find_resource(id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    resources_collection.update_one({"_id": resource["_id"]}, {"$set": data})
    updated = resources_collection.find_one({"_id": resource["_id"]})
    upsert_resource_embedding(updated)
    log_usage("resource_updated", {"resourceId": resource_key(updated)}, payload.get("sub"))
    return {"status": "updated"}


@app.delete("/api/resources/{id}")
def delete_resource(id: str, payload: dict = Depends(require_admin)):
    resource = find_resource(id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    resources_collection.delete_one({"_id": resource["_id"]})
    resource_embeddings_collection.delete_one({"resourceKey": resource_key(resource)})
    log_usage("resource_deleted", {"resourceId": resource_key(resource)}, payload.get("sub"))
    return {"status": "deleted"}
