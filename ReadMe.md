# Reserva — Resource Booking System

**Stack:** React + Spring Boot (STS) + PostgreSQL `Reserva_DB`

## Run

1. **PostgreSQL** — create database `Reserva_DB` (user `postgres` / `admin123`)
2. **STS** — Run `CoreservicesApplication.java` → http://localhost:8080
3. **Frontend** — `cd Frontend` → `npm install` → `npm run dev` → http://localhost:5173

## Demo login

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@reserva.com | admin123 |
| User | Sign up at `/signup` | your choice |

## Pages

- **Explore** — browse & book campus resources (Spring API)
- **Bookings** — your reservations
- **Admin** — manage resources (admin only)
- **Profile** — account from JWT

## API

- Auth: `/authservice/signup`, `/signin`, `/uinfo`
- Resources: `/api/resources`, `/api/resources/search`
- Bookings: `/api/bookings`
- Swagger: http://localhost:8080/swagger-ui.html

## SQL scripts (report only)

`database/schema.sql` — optional; Spring creates tables automatically.

## GitHub JSON catalog

Public page **Catalog** (`/catalog`) loads:

`https://raw.githubusercontent.com/ns-faiza9/Booking-api-data/main/resources.json`

> Use the **raw** GitHub URL, not the blob page URL, for `fetch()`.
