import hashlib
import json
import math
import os
import re
from datetime import datetime

import pymongo

VECTOR_DIMENSIONS = 96

SEMANTIC_SYNONYMS = {
    "meeting": ["meeting", "conference", "boardroom", "room", "discussion", "seminar"],
    "room": ["room", "space", "venue", "hall", "suite"],
    "projector": ["projector", "presentation", "display", "screen", "conference"],
    "lab": ["lab", "laboratory", "computer", "systems", "workstation"],
    "gpu": ["gpu", "graphics", "cuda", "lab", "workstation", "systems"],
    "systems": ["systems", "computer", "workstation", "lab"],
    "equipment": ["equipment", "device", "hardware", "gear"],
    "available": ["available", "free", "open"],
}


def tokenize(text):
    return re.findall(r"[a-z0-9]+", text.lower())


def hashed_embedding(text):
    vector = [0.0] * VECTOR_DIMENSIONS
    for token in tokenize(text):
        tokens = [token, *SEMANTIC_SYNONYMS.get(token, [])]
        for expanded in tokens:
            digest = hashlib.sha256(expanded.encode("utf-8")).hexdigest()
            index = int(digest[:8], 16) % VECTOR_DIMENSIONS
            vector[index] += 1.0

    magnitude = math.sqrt(sum(value * value for value in vector))
    return vector if magnitude == 0 else [value / magnitude for value in vector]


def resource_search_text(resource):
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


def setup_mongodb():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = pymongo.MongoClient(mongo_uri)
    db = client["reservaDB"]

    resources_collection = db["resources"]
    bookings_collection = db["bookings"]
    usage_logs_collection = db["usage_logs"]
    resource_embeddings_collection = db["resource_embeddings"]
    booking_history_collection = db["booking_history"]

    filepath = os.path.join(os.path.dirname(__file__), "MOCK_DATA.json")
    with open(filepath, "r") as file:
        mock_data = json.load(file)

    resources_collection.delete_many({})
    bookings_collection.delete_many({})
    usage_logs_collection.delete_many({})
    resource_embeddings_collection.delete_many({})
    booking_history_collection.delete_many({})

    result = resources_collection.insert_many(mock_data)
    inserted_resources = list(resources_collection.find({"_id": {"$in": result.inserted_ids}}))

    embeddings = []
    for resource in inserted_resources:
        key = str(resource.get("id", resource["_id"]))
        text = resource_search_text(resource)
        embeddings.append(
            {
                "resourceKey": key,
                "resourceObjectId": str(resource["_id"]),
                "numericResourceId": resource.get("id"),
                "text": text,
                "embedding": hashed_embedding(text),
                "updatedAt": datetime.utcnow(),
            }
        )

    if embeddings:
        resource_embeddings_collection.insert_many(embeddings)

    bookings_collection.create_index([("resourceId", 1), ("fromDate", 1), ("toDate", 1), ("status", 1)])
    usage_logs_collection.create_index([("userEmail", 1), ("createdAt", -1)])
    resource_embeddings_collection.create_index("resourceKey", unique=True)
    booking_history_collection.create_index([("userEmail", 1), ("createdAt", -1)])

    print(f"Inserted {len(result.inserted_ids)} resources into reservaDB.resources.")
    print("Prepared usage_logs, resource_embeddings, booking_history, and bookings collections.")


if __name__ == "__main__":
    setup_mongodb()
