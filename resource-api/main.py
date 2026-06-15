import httpx
from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import os

app = FastAPI(
    title="Reserva API Gateway",
    description="API Gateway proxying to Spring Boot and Node.js with validation",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPRING_BOOT_URL = os.getenv("SPRING_BOOT_URL", "http://127.0.0.1:8080")
NODE_JS_URL = os.getenv("NODE_JS_URL", "http://127.0.0.1:3000")
client = httpx.AsyncClient(timeout=30.0)

def model_to_json_bytes(model: BaseModel) -> bytes:
    if hasattr(model, "model_dump_json"):
        return model.model_dump_json().encode()
    return model.json().encode()

# Validation Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class SignupRequest(BaseModel):
    fullname: str | None = None
    email: EmailStr
    username: str | None = None
    password: str
    phone: str | None = None
    role: str | int = "USER"

class BookingRequest(BaseModel):
    resourceId: int | str
    fromDate: str
    toDate: str
    fromTime: str
    toTime: str
    purpose: str

class CatalogResourceRequest(BaseModel):
    catalogId: int
    name: str
    type: str
    location: str
    capacity: int
    price_per_hour: int | float | None = 0
    image: str | None = ""

async def proxy_request(request: Request, target_url: str, body_bytes: bytes = None):
    try:
        body = body_bytes if body_bytes is not None else await request.body()
        headers = dict(request.headers)
        headers.pop("host", None)
        headers.pop("content-length", None)

        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            params=request.query_params,
            content=body
        )
        excluded_headers = {"content-length", "transfer-encoding", "connection"}
        response_headers = {
            key: value
            for key, value in response.headers.items()
            if key.lower() not in excluded_headers
        }
        content_type = response.headers.get("content-type", "")

        if "application/json" in content_type and response.content:
            return JSONResponse(
                status_code=response.status_code,
                content=response.json(),
                headers=response_headers,
            )

        return Response(
            status_code=response.status_code,
            content=response.content,
            media_type=content_type.split(";")[0] if content_type else None,
            headers=response_headers,
        )
    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Backend service unavailable: {str(exc)}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Gateway Error: {str(e)}")

# --- Spring Boot Routes ---
@app.post("/authservice/signin")
async def signin(request: Request, data: LoginRequest):
    return await proxy_request(request, f"{SPRING_BOOT_URL}/authservice/signin", model_to_json_bytes(data))

@app.post("/authservice/signup")
async def signup(request: Request, data: SignupRequest):
    return await proxy_request(request, f"{SPRING_BOOT_URL}/authservice/signup", model_to_json_bytes(data))

@app.get("/authservice/uinfo")
async def get_uinfo(request: Request):
    return await proxy_request(request, f"{SPRING_BOOT_URL}/authservice/uinfo")

@app.post("/api/bookings")
async def create_booking(request: Request, data: BookingRequest):
    return await proxy_request(request, f"{SPRING_BOOT_URL}/api/bookings", model_to_json_bytes(data))

@app.get("/api/bookings")
async def get_bookings(request: Request):
    return await proxy_request(request, f"{SPRING_BOOT_URL}/api/bookings")

@app.delete("/api/bookings/{id}")
async def delete_booking(id: str, request: Request):
    return await proxy_request(request, f"{SPRING_BOOT_URL}/api/bookings/{id}")

# --- Node.js Routes ---
@app.get("/api/resources")
async def get_resources(request: Request):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources")

@app.get("/api/resources/categories")
async def get_categories(request: Request):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources/categories")

@app.get("/api/resources/search")
async def search_resources(request: Request):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources/search")

@app.get("/api/resources/recommendations")
async def recommendations(request: Request):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources/recommendations")

@app.post("/api/resources/from-catalog")
async def ensure_catalog_resource(request: Request, data: CatalogResourceRequest):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources/from-catalog", model_to_json_bytes(data))

@app.post("/api/resources")
async def create_resource(request: Request):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources")

@app.put("/api/resources/{id}")
async def update_resource(id: str, request: Request):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources/{id}")

@app.delete("/api/resources/{id}")
async def delete_resource(id: str, request: Request):
    return await proxy_request(request, f"{NODE_JS_URL}/api/resources/{id}")

@app.get("/api/time-slots")
async def get_time_slots(request: Request):
    # Wait, time-slots require DB conflict checks with bookings. 
    # Spring Boot handles bookings. So time-slots should go to Spring Boot.
    return await proxy_request(request, f"{SPRING_BOOT_URL}/api/time-slots")

# Catch-all
@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def catch_all(path: str, request: Request):
    raise HTTPException(status_code=404, detail="Route not found in API Gateway definition")
