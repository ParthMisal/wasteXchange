# ♻️ wasteXchange (Eco-Sync)

> **A B2B industrial surplus marketplace** that connects waste generators with buyers, turning surplus material into recoverable value through AI-assisted matching.

---

## 🌐 Overview

wasteXchange is a full-stack web platform built for a hackathon. It enables:

- **Sellers** to list industrial surplus / waste materials with quantity, price, purity, photos, and location.
- **Buyers** to search, filter, and browse marketplace listings.
- **AI matching** to score material listings against a buyer's requirement and rank them by match score, distance, or price.
- **Requests & live chat** so buyers can send requests to sellers and track status (Pending → Accepted → In Transit → Completed).
- **Route preview** showing seller ↔ buyer distance and duration on a stylised map.

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

### Prerequisites

| Tool    | Version |
|---------|---------|
| Node.js | 18+     |
| Python  | 3.12+   |
| Docker  | any     |

### 1. Start the local MongoDB instance

```bash
docker compose up -d
```

> This spins up a MongoDB 7 container on `127.0.0.1:27017` with a persistent named volume (`mongo-data`).

### 2. Start the backend

```bash
cd backend

# Create & activate a virtual environment
python -m venv venv
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
# Edit .env with your MongoDB URI and JWT secret (see backend section below)

# Run the server
uvicorn app.main:app --reload
```

Backend available at **http://localhost:8000** — Swagger docs at `/docs`.

### 3. Start the frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend available at **http://localhost:5173**.

---

## 🖥️ Frontend

**Stack:** React 18 · Vite 6 · Tailwind CSS 3 · React Router 7 · Axios · Lucide React

### Pages & Routes

| Path | Access | Description |
|---|---|---|
| `/` | public | Landing / marketing page |
| `/login` | public | Sign in |
| `/signup` | public | Register as seller or buyer |
| `/dashboard/seller` | auth | Seller dashboard (listings & stats) |
| `/dashboard/seller/upload` | auth | Create / edit a material listing |
| `/marketplace` | auth | Browse & filter materials |
| `/match-results` | auth | AI-ranked matches for a requirement |
| `/requests/:id` | auth | Request detail, status, contact, live chat |

Protected routes redirect unauthenticated users to `/login`.

### Design System

Defined in `tailwind.config.js`:

- **Colors** — `primary` (teal `#134E4A`), `accent` (amber `#D97706`), `surface` (`#FAFAF9`), semantic `success` / `warning` / `danger`.
- **Fonts** — Manrope (headings) · Inter (body), loaded via Google Fonts.
- **Utilities** — `.card` and `.fade-in` classes in `src/index.css`.

### Frontend Environment

```env
# frontend/.env
VITE_API_URL=http://localhost:8000
```

### Frontend Structure

```
frontend/src/
├── main.jsx               # App bootstrap: BrowserRouter + AuthProvider
├── App.jsx                # Route definitions + auth guards
├── index.css              # Tailwind directives + base styles
├── api/
│   ├── auth.js            # signup / login
│   ├── materials.js       # search, matches, my-listings, create/delete
│   └── requests.js        # request detail + messages
├── context/
│   └── AuthContext.jsx    # auth state (token/role/user → localStorage)
├── components/
│   ├── MapView.jsx        # stylised route preview
│   └── ui/                # reusable primitives (Button, Card, Input, Badge…)
└── pages/
    ├── Landing.jsx
    ├── Login.jsx / Signup.jsx
    ├── SellerDashboard.jsx
    ├── UploadMaterial.jsx
    ├── Marketplace.jsx
    ├── MatchResults.jsx
    └── RequestDetail.jsx
```

---

## ⚙️ Backend

**Stack:** Python 3.12 · FastAPI · Uvicorn · MongoDB Atlas · Motor · Beanie ODM · Pydantic v2 · Passlib (bcrypt) · python-jose (JWT)

### Backend Environment

```env
# backend/.env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/?retryWrites=true&w=majority
MONGO_DB_NAME=ecosync
JWT_SECRET_KEY=<long-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Generate a strong secret:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

> MongoDB Atlas users: create a cluster, DB user, and whitelist your IP under *Network Access*.

### Backend Structure

```
backend/app/
├── main.py                 # FastAPI app, CORS, lifespan, router wiring
├── core/
│   ├── config.py           # Settings from .env (DB, JWT, CORS)
│   ├── database.py         # MongoDB + Beanie async initialisation
│   └── security.py         # bcrypt hashing + JWT create/decode
├── models/
│   └── user.py             # User Beanie document (MongoDB schema)
├── schemas/
│   ├── auth.py             # Auth request/response models
│   └── user.py             # UserSignup / UserLogin / UserResponse / Token
├── services/
│   └── auth_service.py     # Auth business logic (signup, login)
├── dependencies/
│   └── auth.py             # get_current_user dependency
└── routers/
    ├── health.py           # GET / health check
    └── auth.py             # POST /api/auth/signup, /api/auth/login
```

### API Reference

#### `GET /` — Health check

```json
{ "status": "Backend Running", "database": "Connected" }
```

#### `POST /api/auth/signup` — Register a user

Request:

```json
{
  "name": "Ravi Kumar",
  "company": "Acme Industries",
  "email": "seller@example.com",
  "password": "supersecret123",
  "location": "Mumbai"
}
```

Returns `201 { "message": "User created successfully" }`.  
Errors: `409` duplicate email · `422` validation failure.

#### `POST /api/auth/login` — Authenticate

Returns `200`:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "user": {
    "id": "<user-id>",
    "full_name": "Ravi Kumar",
    "company_name": "Acme Industries",
    "email": "seller@example.com",
    "role": "seller",
    "address": "Mumbai",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

Errors: `401` unknown email or incorrect password.

All authenticated endpoints accept `Authorization: Bearer <token>`.

#### Interactive Docs

- **Swagger UI** — http://localhost:8000/docs
- **ReDoc** — http://localhost:8000/redoc

---

## 🗄️ Database

| Mode | Connection |
|------|------------|
| **Local (Docker)** | `mongodb://wx_admin:passwordLocalServer@127.0.0.1:27017` |
| **Cloud** | MongoDB Atlas — configure `MONGO_URI` in `backend/.env` |

The `docker-compose.yml` at the project root starts a MongoDB 7 container with a named persistent volume (`mongo-data`).

---

## 🔐 Authentication Flow

1. User signs up (`POST /api/auth/signup`) — password stored as a bcrypt hash, never plain text.
2. User logs in (`POST /api/auth/login`) — server returns a signed JWT.
3. Frontend stores `token`, `role`, and `user` in `localStorage` under `ecosync_token`, `ecosync_role`, `ecosync_user`.
4. Role determines post-auth redirect: **seller** → `/dashboard/seller` · **buyer** → `/marketplace`.
5. All subsequent API calls send `Authorization: Bearer <token>`.

---

## 📋 Current Status

| Feature | Status |
|---|---|
| FastAPI app + Swagger docs | ✅ Done |
| MongoDB connection (async Motor + Beanie) | ✅ Done |
| CORS middleware | ✅ Done |
| User signup & login (JWT) | ✅ Done |
| Frontend auth (signup / login / route guards) | ✅ Done |
| Seller dashboard & material listings UI | ✅ Done |
| Marketplace browse & filter UI | ✅ Done |
| AI match results UI | ✅ Done |
| Request detail & live chat UI | ✅ Done |
| Backend: materials, requests, AI matching endpoints | 🚧 Not yet built |

---

## 🛣️ Roadmap

- [ ] Backend: materials CRUD endpoints
- [ ] Backend: requests & messaging endpoints
- [ ] Backend: AI matching service
- [ ] Image upload support (multipart)
- [ ] WebSocket live chat
- [ ] Deployment (Docker Compose / cloud)

---

## 📄 License

This project was created for a hackathon. All rights reserved.