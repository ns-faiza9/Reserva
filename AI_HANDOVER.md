# AI Agent Handover Document

Welcome! If you are an AI agent picking up this project, please read this document carefully. It contains the **actual current state** of the project, which has diverged from the original `IMPLEMENTATION_PLAN.md` and `ReadMe.md`.

## 🏗️ Architecture Shift (CRITICAL CONTEXT)
Originally, this project was designed to use a **Java Spring Boot (`coreservices`) + PostgreSQL** backend running on port `8080`. 
**However, the user has migrated the backend to Python (FastAPI) + MongoDB.** 

The active backend is now located in the `resource-api` folder and runs on port `8000`. Please **ignore** the `Backend/coreservices` directory unless explicitly asked to revert to it.

## 📁 Active Directory Structure
1. `Frontend/` - React (Vite) application.
2. `resource-api/` - The new FastAPI + MongoDB backend.
3. `database/` - Legacy SQL scripts (Ignore for now).
4. `Backend/` - Legacy Java Spring Boot application (Ignore for now).

## 🚀 Running the Project
**Frontend:**
```bash
cd Frontend
npm run dev # Runs on http://localhost:5173
```
*Note: Ensure `Frontend/.env` is set to `VITE_API_URL=http://localhost:8000`*

**Backend:**
```bash
cd resource-api
uvicorn main:app --reload # Runs on http://localhost:8000
```
*Note: Make sure a local MongoDB instance is running on `mongodb://localhost:27017/`*

## 🛠️ Current Backend State (`resource-api`)
The Python backend currently handles all primary operations:
- **Database Initialization:** `setup_db.py` reads from `MOCK_DATA.json` and populates the `reservaDB.resources` MongoDB collection.
- **Authentication:** Currently **mocked**. `POST /authservice/signin` and `POST /authservice/signup` will accept any input and return a dummy JWT with `role: 2`.
- **Resources:** Fully implemented (`/api/resources`, `/api/resources/search`, `/api/resources/categories`, `/api/resources/from-catalog`, `/api/resources/recommendations`).
- **Bookings:** Fully implemented (`/api/bookings`).
  - *Quirk:* In MongoDB, resources have both a string `_id` and a numeric `id` (from the mock JSON). The frontend expects `b.resourceName` and `b.resourceLocation` directly on the booking objects. The `get_bookings` endpoint flattens these properties and maps the DB IDs correctly.

## 📝 Where I Left Off
1. Fixed the `.env` mismatch that was causing 404s when attempting to book a resource.
2. Implemented the entire `/api/bookings` and `/api/resources` flows in `main.py` to match the frontend's expected signatures.
3. Fixed UI rendering bugs on the "My Bookings" page by flattening `resourceName`, `resourceLocation`, and attaching `status: "CONFIRMED"` directly to the booking response dictionary in the python API.

## ⏭️ Next Steps / Potential Tasks
If you are continuing work, here are the likely next targets:
1. **Real Authentication:** Replace the mocked JWT logic in `resource-api/main.py` with actual user registration and password hashing (e.g., using `passlib` and creating a `users` collection in MongoDB).
2. **Conflict Resolution:** Enhance `/api/bookings` to prevent double-booking of the same resource at the same time.
3. **Admin Dashboard:** Implement or verify the frontend Admin flows for creating/updating/deleting resources via the API endpoints we just added.
4. **Cleanup:** Eventually deprecate and remove the old Java `Backend/` folder if it is 100% no longer needed.
