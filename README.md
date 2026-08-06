# ♻️ wasteXchange (Eco-Sync)

> **A B2B industrial surplus marketplace** that connects waste generators with buyers, turning surplus material into recoverable value through AI-assisted matchmaking.

---

## 🌐 Overview

- **Sellers** list industrial surplus / waste materials with quantity, price, purity, photos, condition, and location.
- **Buyers** search, filter, save, and request materials from the marketplace.
- **Dual-role accounts** — the same email can act as buyer AND seller, with a one-click role switcher in the navbar.
- **AI matchmaking** — every listing is scored on *deal quality* (category fit, quantity fit, price competitiveness, quality signals, seller trust) blended with *distance* (Google Distance Matrix with haversine fallback). Optionally refined by Gemini/OpenAI.
- **Requests & live chat** — buyers request listings, sellers accept/reject and advance status (Pending → Accepted → In Transit → Completed), with a real-time polling chat.
- **Google Maps** — live route previews between buyer and seller, Places autocomplete on location inputs, geocoding & distance via the backend (no key required for the map embeds).
- **Impact tracking** — dashboards show tonnes diverted, CO₂e saved, trees/cars/kWh equivalents.

---

## 🏗️ Architecture

```
wasteXchange/
├── frontend/          # React 18 + Vite 6 + Tailwind CSS SPA
├── backend/           # Python FastAPI + MongoDB (Beanie ODM) REST API
└── docker-compose.yml # Local MongoDB container
```

The two services are decoupled: the frontend talks to the backend exclusively through REST API calls prefixed with `VITE_API_URL`.

---

## 🚀 Quick Start

| Tool    | Version |
|---------|---------|
| Node.js | 18+     |
| Python  | 3.12+   |
| Docker  | any     |

### 1. Start MongoDB (Docker)

```bash
docker compose up -d
```

### 2. Start the backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
# source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
copy .env.example .env            # then edit JWT_SECRET_KEY etc.
uvicorn app.main:app --reload
```

Seed demo data (2 users + 18 materials):

```bash
python -m app.seed
```

Backend available at **http://localhost:8000** — Swagger docs at `/docs`.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend available at **http://localhost:5173**.

### Demo accounts (after seeding)

| Email | Password | Roles |
|---|---|---|
| `seller@ecosync.in` | `password123` | Seller (Mumbai) |
| `both@ecosync.in` | `password123` | **Buyer + Seller** (Pune) |

---

## ✨ Key Features

### Dual-role accounts
- Signup offers **Seller**, **Buyer**, or **Buyer & Seller**.
- Login returns all roles; the navbar shows a **Switch role** dropdown for dual accounts.
- Buyers can upgrade to seller (and vice versa) anytime via `POST /api/auth/me/roles`.

### AI matchmaking (`GET /api/match`)
```
match_score = 0.65 × deal_quality + 0.35 × distance_score
```
- **Deal quality** — category similarity, quantity compatibility, price vs. market average, purity/grade signals, seller trust.
- **Distance** — Google Distance Matrix API when `GOOGLE_MAPS_API_KEY` is set; haversine fallback otherwise.
- **LLM refinement (optional)** — set `AI_PROVIDER=gemini|openai` and `AI_API_KEY`; the model re-ranks top candidates and adds an AI market insight.
- The UI exposes the full score breakdown ("Why this score?") per match.

### Google Maps
- `GET /api/maps/geocode` and `GET /api/maps/distance` proxy the Google APIs (key stays server-side).
- Real map embeds (no API key) in request details; Places autocomplete when `VITE_GOOGLE_MAPS_API_KEY` is set.

### Dashboards
- **Seller** — listings CRUD, requests received with statuses, live carbon impact, AI insight.
- **Buyer** — requests tracking, saved materials, AI recommendations, procurement impact, AI matchmaking form.

### Requests & chat
- Buyers request listings (duplicate pending requests blocked); sellers accept/reject/advance; material status auto-updates (reserved/sold).
- Per-request chat with 5s polling.

---

## 🖥️ Frontend

**Stack:** React 18 · Vite 6 · Tailwind CSS 3 · React Router 7 · Axios · Lucide React

### Pages & Routes

| Path | Access | Description |
|---|---|---|
| `/` | public | Landing / marketing page |
| `/login` | public | Sign in |
| `/signup` | public | Register as seller, buyer, or both |
| `/dashboard` | auth | Redirects to active role's dashboard |
| `/dashboard/seller` | auth + seller | Listings, requests, carbon impact |
| `/dashboard/buyer` | auth + buyer | Requests, saved, AI recs, impact |
| `/dashboard/seller/upload` | auth + seller | Create / edit a listing (`?edit=<id>`) |
| `/marketplace` | auth | Browse, filter, save & request materials |
| `/match-results` | auth + buyer | AI-ranked matches with score breakdown |
| `/requests/:id` | auth | Status stepper, actions, route map, live chat |

Protected routes redirect unauthenticated users to `/login`; role-restricted routes redirect to the right dashboard.

---

## ⚙️ Backend

**Stack:** Python 3.12 · FastAPI · Uvicorn · Motor · Beanie ODM · Pydantic v2 · Passlib (bcrypt) · python-jose (JWT) · httpx

```
backend/app/
├── main.py                 # FastAPI app, CORS, static uploads, router wiring
├── seed.py                 # Demo data seeder
├── core/
│   ├── config.py           # Settings from .env (DB, JWT, CORS, Maps, AI, uploads)
│   ├── database.py         # MongoDB + Beanie async initialisation
│   └── security.py         # bcrypt hashing + JWT create/decode
├── models/                 # User, Material, Request, Message, SavedMaterial
├── schemas/                # Pydantic request/response models
├── services/
│   ├── auth_service.py     # signup/login + dual-role management
│   ├── maps_service.py     # Google Geocoding/Distance Matrix + haversine fallback
│   ├── matching_service.py # deal-quality + distance scoring engine
│   ├── ai_service.py       # Gemini/OpenAI refinement + market insight
│   └── image_service.py    # local image storage
├── dependencies/auth.py    # get_current_user (JWT bearer)
└── routers/
    ├── health.py           # GET /
    ├── auth.py             # signup, login, me, me/roles
    ├── materials.py        # CRUD, search, my-listings, summary, save/unsave
    ├── requests.py         # create, list, status, messages
    ├── match.py            # GET /api/match (AI matchmaking)
    ├── maps.py             # geocode + distance endpoints
    └── dashboard.py        # seller & buyer dashboard aggregates
```

### API surface

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | – | Health check (incl. DB ping) |
| POST | `/api/auth/signup` | – | Register (role or roles) |
| POST | `/api/auth/login` | – | Login → JWT + roles |
| GET | `/api/auth/me` | ✓ | Current profile |
| POST | `/api/auth/me/roles` | ✓ | Add buyer/seller role |
| GET | `/api/materials/search` | ✓ | Search/filter, distance-aware sort |
| POST | `/api/materials` | ✓ seller | Create listing (multipart images) |
| GET/PUT/DELETE | `/api/materials/{id}` | ✓ | Read/update/delete own listing |
| GET | `/api/materials/my-listings` | ✓ seller | Own listings |
| GET | `/api/materials/my-listings/summary` | ✓ seller | Dashboard stats |
| GET | `/api/materials/saved` | ✓ buyer | Saved materials |
| POST/DELETE | `/api/materials/{id}/save` | ✓ buyer | Save / unsave |
| POST | `/api/requests` | ✓ buyer | Send request |
| GET | `/api/requests` | ✓ | List (buyer or seller view) |
| GET/PATCH | `/api/requests/{id}` , `/status` | ✓ | Detail + status transitions |
| GET/POST | `/api/requests/{id}/messages` | ✓ | Chat |
| GET | `/api/match` | ✓ buyer | AI matchmaking |
| GET | `/api/maps/geocode` | ✓ | Address → coordinates |
| GET | `/api/maps/distance` | ✓ | Distance + duration |
| GET | `/api/dashboard/seller` | ✓ seller | Stats, requests, impact, AI insight |
| GET | `/api/dashboard/buyer` | ✓ buyer | Stats, recs, impact, AI insight |

---

## 🔐 Authentication Flow

1. Signup (`POST /api/auth/signup`) — password stored as a bcrypt hash.
2. Login returns a signed JWT plus the user's `roles` array.
3. Frontend stores `token`, `role`, `active_role`, `user` in `localStorage`.
4. Dual accounts can switch active role from the navbar; all API calls send `Authorization: Bearer <token>`.

---

## 🗺️ Google Maps & AI configuration

| Env var | Where | Effect |
|---|---|---|
| `GOOGLE_MAPS_API_KEY` | backend/.env | Real geocoding + distance matrix (fallback: haversine + city lookup) |
| `VITE_GOOGLE_MAPS_API_KEY` | frontend/.env | Places autocomplete in forms |
| `AI_PROVIDER` | backend/.env | `gemini` / `openai` / `none` |
| `AI_API_KEY` | backend/.env | LLM key (refines scores + market insights) |
| `AI_MODEL` | backend/.env | e.g. `gemini-2.0-flash` |

All features degrade gracefully — the platform is fully functional without any keys.

---

## 🗄️ Database

| Mode | Connection |
|------|------------|
| **Local (Docker)** | `mongodb://admin:password@localhost:27017/?authSource=admin` (db `ecosync`) |

Collections: `users`, `materials`, `requests`, `messages`, `saved_materials`.

---

## 📋 Current Status

| Feature | Status |
|---|---|
| FastAPI + MongoDB (Beanie) + JWT auth | ✅ |
| Dual-role accounts + role switching | ✅ |
| Materials CRUD + image uploads | ✅ |
| Marketplace search/filter/sort + distance | ✅ |
| AI matchmaking (deal quality + distance + LLM) | ✅ |
| Requests, status workflow & live chat | ✅ |
| Saved materials | ✅ |
| Google Maps (geocode, distance, embeds, Places) | ✅ |
| Seller & buyer dashboards with impact tracking | ✅ |
| Seed data + demo accounts | ✅ |
