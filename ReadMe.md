# Reserva - Resource Booking System

**Stack:** React + FastAPI Gateway + Spring Boot + Node.js + PostgreSQL + MongoDB

## Services

| Service | Purpose | Local URL |
| --- | --- | --- |
| Frontend | React UI | http://localhost:5173 |
| FastAPI Gateway | Routes frontend requests to backend services | http://localhost:8000 |
| Spring Boot | JWT auth, RBAC user info, bookings, time slots | http://localhost:8080 |
| Node.js | Resource CRUD, categories, search, recommendations | http://localhost:3000 |
| PostgreSQL | Spring auth/bookings database | `Reserva_DB` |
| MongoDB | Node resource catalog database | `reservaDB` |

## Run Locally

1. Create PostgreSQL database `Reserva_DB` using user `postgres` and password `admin123`, or override Spring datasource environment variables.
2. Optional: start MongoDB at `mongodb://127.0.0.1:27017/reservaDB`. If MongoDB is unavailable, the Node resource service automatically uses the bundled catalog fallback.
3. Run all services:

   ```bat
   run-all.bat
   ```

4. Open http://localhost:5173/Reserva/resources.

## Manual Run

```bat
cd Backend\coreservices
.\mvnw.cmd spring-boot:run

cd Backend\node-service
node index.js

cd resource-api
python -m uvicorn main:app --port 8000 --reload

cd Frontend
npm run dev
```

## Demo Login

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@reserva.com | admin123 |
| User | Sign up at `/signup` | your choice |

## API Highlights

- Auth: `/authservice/signup`, `/authservice/signin`, `/authservice/uinfo`
- Resources: `/api/resources`, `/api/resources/categories`, `/api/resources/search`
- Bookings: `/api/bookings`
- Time slots: `/api/time-slots`
- Node health: `http://localhost:3000/health`
- Spring Swagger: `http://localhost:8080/swagger-ui.html`

## Validation

```bat
cd Frontend && npm run build && npm run lint
cd Backend\coreservices && .\mvnw.cmd test
```
