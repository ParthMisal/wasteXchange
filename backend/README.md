# Eco-Sync Backend

FastAPI + MongoDB (Beanie ODM) backend for the wasteXchange industrial surplus marketplace.

**Status:** fully implemented — auth (dual-role), materials CRUD + uploads, requests & chat, AI matchmaking, Google Maps integration, and seller/buyer dashboards.

---

## Run

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows
# source .venv/bin/activate       # macOS / Linux
pip install -r requirements.txt
copy .env.example .env            # then edit JWT_SECRET_KEY

uvicorn app.main:app --reload     # http://localhost:8000, Swagger at /docs
```

Seed demo data:

```bash
python -m app.seed
```

## Environment

See `.env.example` for all options — including optional
`GOOGLE_MAPS_API_KEY` (real geocoding + distance matrix) and
`AI_PROVIDER` / `AI_API_KEY` (Gemini/OpenAI score refinement). Every feature
works without keys via heuristics + haversine fallbacks.

## Structure

```
app/
├── main.py                 # FastAPI app, CORS, static uploads, routers
├── seed.py                 # demo users + materials
├── core/                   # config, database, security (bcrypt + JWT)
├── models/                 # User, Material, Request, Message, SavedMaterial
├── schemas/                # pydantic request/response models
├── services/               # auth, maps (Google + fallback), matching (AI),
│                           # ai_service (LLM), image storage
├── dependencies/auth.py    # get_current_user (JWT bearer)
└── routers/                # auth, materials, requests, match, maps, dashboard
```

See the root `../README.md` for the full API reference and feature documentation.
