# Reserva — Implementation Plan (DBD Final Project)

**Goal:** Turn the current prototype into a **submission-ready PS-10 Resource Booking & Availability System** that aligns with course expectations (PostgreSQL + Spring Boot in STS + React), Sec913 backend patterns, and clear documentation for demo/viva.

**Stack (confirmed):** React (Vite) · Spring Boot `coreservices` · PostgreSQL `Reserva_DB` · No Docker required.

**Estimated effort:** 5–8 working days (solo), depending on MongoDB requirement from instructor.

---

## 1. Success criteria (definition of “finished”)

The project is **done** when all of the following are true:

| # | Criterion |
|---|-----------|
| 1 | User can **register, login, logout** via backend API (not `localStorage`-only fake auth). |
| 2 | Bookings store **purpose**, link to real **user id**, and survive page refresh. |
| 3 | **Conflict-free** booking is enforced server-side and covered by at least one test. |
| 4 | **Resources** can be listed, filtered by category, searched, and (admin) managed via API. |
| 5 | **Availability** per resource + date + time slot is visible in UI. |
| 6 | **Recommendations** use persisted booking history. |
| 7 | Repository includes **`database/schema.sql`**, **`database/seed.sql`**, ERD, and run guide for STS. |
| 8 | Demo script works end-to-end without manual DB edits. |
| 9 | *(If instructor requires PS-10 NoSQL)* MongoDB collections + vector-style search documented and working. |

---

## 2. Target architecture

```
┌─────────────────┐     HTTPS/JSON      ┌──────────────────────────┐
│  React (Vite)   │ ◄─────────────────► │  Spring Boot coreservices │
│  localhost:5173 │   JWT in header     │  localhost:8080           │
└─────────────────┘                     └────────────┬─────────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────────┐
                                          │  PostgreSQL          │
                                          │  Reserva_DB          │
                                          │  users, resources,   │
                                          │  bookings, time_slots│
                                          └──────────────────────┘

Optional (Phase 7 — if rubric requires):
                                          ┌──────────────────────┐
                                          │  MongoDB Atlas/local   │
                                          │  usage_logs,           │
                                          │  resource_embeddings,  │
                                          │  booking_history       │
                                          └──────────────────────┘
```

---

## 3. Database design (PostgreSQL)

### 3.1 Tables to implement / extend

| Table | Purpose | Notes |
|-------|---------|--------|
| `users` | Auth & profile | Mirror Sec913: `id`, `fullname`, `email`, `password`, `phone`, `role`, `status` |
| `resources` | Rooms, labs, equipment | Already exists; add `created_at` optional |
| `time_slots` | Bookable windows | Already exists |
| `bookings` | Reservations | **Add `purpose`**, optional `created_at` |
| `roles` | Admin / User | Optional simple enum in `users.role` (1=User, 2=Admin) |

### 3.2 Deliverables

- [ ] `database/schema.sql` — `CREATE TABLE` scripts (for report + manual setup)
- [ ] `database/seed.sql` — roles, admin user, sample resources, time slots
- [ ] `database/ERD.png` or `.drawio` — one-page ER diagram
- [ ] Switch `ddl-auto` to `validate` in production profile; keep `update` for dev only

### 3.3 Sample `bookings` change

```sql
ALTER TABLE bookings ADD COLUMN purpose VARCHAR(500);
ALTER TABLE bookings ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

---

## 4. Implementation phases

### Phase 1 — Foundation & cleanup (Day 1)

**Objective:** Clean repo and lock configuration.

| Task | Owner | Files / area |
|------|--------|----------------|
| Remove or archive `final-project1/` (duplicate UI) | Dev | Root |
| Single README: problem statement + STS steps + API table | Dev | `ReadMe.md` |
| Add `application-dev.properties` (postgres/admin123) | Backend | `resources/` |
| Add `.env.example` for frontend (`VITE_API_URL`) | Frontend | `Frontend/` |
| Document STS import + Run configuration | Docs | `ReadMe.md` |

**Exit:** Fresh clone can follow README without confusion.

---

### Phase 2 — Authentication (Sec913 pattern) (Days 1–2)

**Objective:** Real users in PostgreSQL; JWT on API calls.

#### Backend

| Task | Details |
|------|---------|
| Create `Users` entity + `UsersRepository` | Copy pattern from `Sec913_3_springtoolFSAD` |
| `UsersService` | `signup`, `signin`, `uinfo` (JWT), password check |
| `UsersController` | `/authservice/signup`, `/authservice/signin`, `/authservice/uinfo` |
| JWT util | Use existing `jjwt` deps in `pom.xml` |
| Seed admin + demo user | In `DataInitializer` or `seed.sql` |
| Secure booking endpoints | Require valid token; `userId` from token, not request body |

#### Frontend

| Task | Details |
|------|---------|
| `auth.js` | Call `/authservice/signin` & `/authservice/signup`; store JWT |
| `api.js` | Axios interceptor: `Authorization` or `Token` header (match Sec913) |
| Login / Signup pages | Wire to API; show API errors |
| Protected routes | Redirect if no token / 401 |

**Exit:** Login → browse resources → book as logged-in user; bookings tied to email/id in DB.

---

### Phase 3 — Booking & data integrity (Day 2–3)

**Objective:** Complete booking model and business rules.

#### Backend

| Task | Details |
|------|---------|
| Add `purpose` (and optional `createdAt`) to `Booking` entity | JPA migration via ddl-auto or SQL script |
| Persist `purpose` in `BookingService.createBooking` | Return in `BookingResponse` |
| `@Valid` on `BookingRequest` | Not null fields, future date rules |
| `GlobalExceptionHandler` | Consistent `{ "message": "..." }` JSON |
| `BookingRepository` | `findByUserIdAndStatusNot` for recommendations |
| Transaction boundaries | `@Transactional` on book/cancel |

#### Frontend

| Task | Details |
|------|---------|
| Booking modal | Already sends purpose — verify list shows it after reload |
| Bookings page | Load from API with JWT user; cancel calls DELETE |
| Calendar view | Map API `startTime`/`endTime` correctly |

#### Tests

| Test | Description |
|------|-------------|
| `BookingServiceTest` | Double booking same slot → exception |
| `BookingServiceTest` | Cancel frees slot |
| `ResourceControllerTest` | GET `/api/resources` returns list |

**Exit:** Purpose visible after refresh; conflict returns clear error in UI.

---

### Phase 4 — Resources & admin (Day 3–4)

**Objective:** Full resource lifecycle and categorization.

#### Backend

| API | Method | Role |
|-----|--------|------|
| `/api/resources` | GET | All users |
| `/api/resources` | POST | Admin |
| `/api/resources/{id}` | PUT | Admin |
| `/api/resources/{id}` | DELETE | Admin (soft-delete or block if active bookings) |
| `/api/resources/categories` | GET | All |
| `/api/resources/search` | GET | Semantic search (keep in-memory or Phase 7 Mongo) |

#### Frontend

| Page / component | Feature |
|------------------|---------|
| Resources | Category filter + search (existing) |
| **Admin → Manage Resources** | Table + add/edit form (admin role only) |
| Navbar | Show Admin link when `role === 2` or `3` |

**Exit:** Admin can add “New Lab C” without editing code/DB manually.

---

### Phase 5 — Intelligence features (Day 4–5)

**Objective:** Satisfy “intelligent recommendations” and search requirements credibly.

| Feature | PostgreSQL-only approach (current path) | Stronger (if rubric needs Mongo) |
|---------|----------------------------------------|----------------------------------|
| Semantic search | `EmbeddingService` + cosine on resource text | Store vectors in `resource_embeddings` |
| Recommendations | User’s past `bookings` by type/location | + `booking_history` on cancel |
| Usage analytics | `usage_logs` table in PostgreSQL | Mongo `usage_logs` collection |

#### Tasks

- [ ] Tune search vocabulary for demo queries (“projector”, “GPU”, “meeting room”)
- [ ] Recommendations: exclude already-booked resources on selected date
- [ ] Optional: `GET /api/analytics/popular-resources` for report chart

**Exit:** Demo queries return sensible ranked results; recommendations change after user books a Lab.

---

### Phase 6 — Polish, docs & submission package (Day 5–6)

#### Documentation (for report + viva)

| Document | Content |
|----------|---------|
| `ReadMe.md` | Problem, stack, setup, API, screenshots |
| `IMPLEMENTATION_PLAN.md` | This file (mark phases done) |
| `docs/ARCHITECTURE.md` | Diagram + layer description |
| `docs/DEMO_SCRIPT.md` | Step-by-step 5-minute demo |
| `docs/TESTING.md` | Manual test cases + JUnit summary |
| ERD | `docs/erd.png` |

#### UI polish

- [ ] Loading spinners on Resources / Bookings
- [ ] Toast or inline errors instead of `alert()` only
- [ ] Empty states (“No bookings yet”)
- [ ] Confirm cancel booking

#### API

- [ ] Swagger annotations on controllers
- [ ] Postman collection export `docs/Reserva_API.postman_collection.json`

#### Code quality

- [ ] Remove unused mail dependency OR send booking confirmation email
- [ ] Consistent package naming (`mth.entity` vs `mth.models` — pick one)
- [ ] Remove leftover Sec913 `Readme.txt` or replace with Reserva seed instructions

**Exit:** Zip/repo ready to submit with report references.

---

### Phase 7 — Optional: MongoDB (only if instructor requires PS-10 NoSQL)

**Skip if viva is PostgreSQL-only.**

| Task | Details |
|------|---------|
| Re-add `spring-boot-starter-data-mongodb` | `pom.xml` |
| MongoDB Atlas free tier | Connection string in `application.properties` |
| Documents | `UsageLog`, `ResourceEmbedding`, `BookingHistory` |
| On booking create | Write `usage_logs` |
| On cancel | Archive to `booking_history` |
| On resource save | Sync `resource_embeddings` |
| Search | Vector similarity or Atlas Vector Search index |
| Report section | Explain polyglot persistence (SQL vs NoSQL) |

**Exit:** Meets original PS-10 MongoDB + vector search wording.

---

## 5. Frontend page checklist

| Page | Status now | Target |
|------|------------|--------|
| Home | OK | Link to login/resources |
| Login / Signup | localStorage | Backend JWT |
| Resources | API wired | + admin CRUD link |
| Bookings | API wired | Purpose + errors |
| Profile | localStorage | Load from `/authservice/uinfo` |
| About / Contact | Static | Optional CMS or leave static |
| **Admin Resources** | Missing | **Build** |

---

## 6. API checklist (final)

| Endpoint | Auth | Status |
|----------|------|--------|
| `POST /authservice/signup` | Public | To build |
| `POST /authservice/signin` | Public | To build |
| `GET /authservice/uinfo` | Token | To build |
| `GET /api/resources` | User | Done |
| `POST/PUT/DELETE /api/resources` | Admin | Partial / to build |
| `GET /api/resources/search` | User | Done |
| `GET /api/resources/recommendations` | User | Done |
| `GET /api/time-slots` | User | Done |
| `POST /api/bookings` | User | Done (fix purpose) |
| `GET /api/bookings` | User | Done |
| `DELETE /api/bookings/{id}` | User | Done |

---

## 7. Testing & demo plan

### Manual test script (viva)

1. Register new user → login  
2. Semantic search: “meeting room with projector”  
3. Book resource → see in My Bookings  
4. Try double-book same slot → error  
5. Cancel booking → slot available again  
6. Login as admin → add new resource → visible to user  
7. Show pgAdmin tables populated  

### Automated (minimum)

- `CoreservicesApplicationTests` — context loads  
- `BookingServiceTest` — conflict detection  
- `AuthServiceTest` — signin valid/invalid  

---

## 8. Suggested timeline

| Phase | Days | Cumulative |
|-------|------|------------|
| 1 — Cleanup | 0.5 | 0.5 |
| 2 — Auth | 1.5 | 2 |
| 3 — Bookings | 1 | 3 |
| 4 — Admin resources | 1 | 4 |
| 5 — Search & recommendations | 1 | 5 |
| 6 — Docs & polish | 1 | 6 |
| 7 — MongoDB *(optional)* | 1–2 | 7–8 |

---

## 9. Risk register

| Risk | Mitigation |
|------|------------|
| Instructor requires MongoDB | Do Phase 7 or clarify in report why PostgreSQL JSON/embeddings alternative was chosen |
| JWT differs from Sec913 | Copy `UsersService` signin/token logic exactly from Sec913 project |
| `Reserva_DB` case sensitivity | Use quoted `"Reserva_DB"` in pgAdmin or lowercase consistently |
| Lazy loading errors on bookings | `@Transactional` on service methods returning entities with relations |
| STS Maven not updating | Maven → Update Project after `pom.xml` changes |

---

## 10. Recommended build order (single thread)

```
Phase 1 → Phase 2 (auth) → Phase 3 (purpose + validation)
    → Phase 4 (admin CRUD) → Phase 5 (search tuning)
    → Phase 6 (docs + demo)
    → Phase 7 only if required
```

---

## 11. What you can claim in the final report

After all phases (1–6, optionally 7):

- **Polyglot / persistence:** PostgreSQL relational model for ACID bookings; *(optional)* MongoDB for logs/embeddings  
- **Conflict-free reservation:** DB uniqueness + service-layer check  
- **Availability:** Derived from bookings per slot  
- **Intelligent selection:** Semantic search + collaborative filtering from user history  
- **Full-stack:** STS Spring Boot + React + documented schema  

---

*Last updated: Phases 2–4 implemented (auth, purpose, admin CRUD, SQL scripts). Phase 6 docs partial. Phase 7 MongoDB skipped.*

**Completed:** JWT auth, users table, booking purpose, admin page, `database/schema.sql`, conflict test.
