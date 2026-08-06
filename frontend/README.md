# Eco-Sync — Industrial Surplus Marketplace (Frontend)

Frontend for a B2B platform that connects industrial waste generators with buyers, turning surplus material into recoverable value through AI-assisted matching.

Built with **React 18 + Vite 6 + Tailwind CSS 3 + React Router 7**.

## What this app does

- **Sellers** list surplus/industrial materials (quantity, price, purity, photos, location).
- **Buyers** search, filter, and browse the marketplace.
- **AI matching** scores material listings against a buyer's requirement and ranks them by match score, distance, or price.
- **Requests & chat** — buyers send requests to sellers, follow the status (Pending → Accepted → In Transit → Completed), and message the counterparty.
- **Route preview** shows seller ↔ buyer distance/duration on a stylised map.

## Tech stack

| Concern      | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | React 18 (JSX)                              |
| Build tool   | Vite 6                                      |
| Styling      | Tailwind CSS 3 (custom theme in `tailwind.config.js`) |
| Routing      | react-router-dom v7 (`BrowserRouter`)       |
| HTTP         | axios                                       |
| Icons        | lucide-react                                |

## Getting started

Requirements: Node.js 18+.

```bash
npm install
npm run dev        # start dev server (default http://localhost:5173)
```

Other scripts:

```bash
npm run build      # production build -> dist/
npm run preview    # preview the production build locally
```

## Environment configuration

Copy or edit `.env`:

```
VITE_API_URL=http://localhost:3000
```

All API calls are prefixed with `VITE_API_URL`. It must point at the backend server (not included in this repo).

## Project structure

```
.
├── index.html                 # SPA entry point
├── vite.config.js             # Vite config (React plugin)
├── tailwind.config.js         # Design tokens: colors, fonts, shadows
├── postcss.config.js
├── .env                       # API base URL
└── src/
    ├── main.jsx               # App bootstrap: BrowserRouter + AuthProvider
    ├── App.jsx                # Route definitions + auth guards
    ├── index.css              # Tailwind directives + base styles + .card / .fade-in
    ├── api/                   # Axios API clients
    │   ├── auth.js            # signup / login
    │   ├── materials.js       # search, matches, my-listings, create/delete
    │   └── requests.js        # request detail + messages
    ├── context/
    │   └── AuthContext.jsx    # auth state, persists token/role/user in localStorage
    ├── components/
    │   ├── MapView.jsx        # stylised route preview (no external map API)
    │   └── ui/                # reusable primitives
    │       ├── Button.jsx     # variants: primary/secondary/ghost, sizes sm/md/lg
    │       ├── Card.jsx
    │       ├── Input.jsx
    │       ├── Select.jsx
    │       ├── Badge.jsx      # verified/pending/available/reserved/sold/neutral
    │       └── MatchScoreBadge.jsx  # circular AI match-score ring (amber→teal)
    └── pages/
        ├── Landing.jsx             # marketing landing page
        ├── Login.jsx               # sign in
        ├── Signup.jsx              # sign up (role: seller / buyer)
        ├── SellerDashboard.jsx     # listings, summary stats, delete
        ├── UploadMaterial.jsx      # create/edit listing with image upload
        ├── Marketplace.jsx         # search + filter + browse listings
        ├── MatchResults.jsx        # AI-ranked matches from a requirement
        └── RequestDetail.jsx       # status steps, contact, route, live chat
```

## Routes

| Path                          | Access | Description                                    |
| ----------------------------- | ------ | ---------------------------------------------- |
| `/`                           | public | Landing page                                   |
| `/login`, `/signup`           | public | Authentication                                 |
| `/dashboard/seller`           | auth   | Seller dashboard (listings & stats)            |
| `/dashboard/seller/upload`    | auth   | Create / edit a material listing (`?edit=<id>`) |
| `/marketplace`                | auth   | Browse and filter materials                    |
| `/match-results`              | auth   | AI match results for a requirement             |
| `/requests/:id`               | auth   | Request detail, status, contact, chat          |

Protected routes redirect unauthenticated users to `/login`.

## API endpoints consumed (frontend)

| Module        | Method | Endpoint                             |
| ------------- | ------ | ------------------------------------ |
| auth          | POST   | `/api/auth/signup`, `/api/auth/login` |
| materials     | GET    | `/api/materials/search`              |
| materials     | GET    | `/api/match`                         |
| materials     | GET    | `/api/materials/my-listings`, `/api/materials/my-listings/summary` |
| materials     | POST   | `/api/materials` (multipart, supports images) |
| materials     | DELETE | `/api/materials/:id`                 |
| requests      | GET    | `/api/requests/:id`                  |
| requests      | GET    | `/api/requests/:id/messages`         |
| requests      | POST   | `/api/requests/:id/messages`         |

Authenticated requests send `Authorization: Bearer <token>` where the token is read from `localStorage` (`ecosync_token`).

## Auth model

- `AuthContext` stores `token`, `role`, and `user` in `localStorage` under the keys `ecosync_token`, `ecosync_role`, `ecosync_user`.
- On login/signup, the role decides the post-auth redirect: **seller** → `/dashboard/seller`, **buyer** → `/marketplace`.

## Design system

Defined in `tailwind.config.js`:

- **Colors** — `primary` (teal `#134E4A`), `accent` (amber `#D97706`), `surface` (`#FAFAF9`), `ink` text scale, plus `success` / `warning` / `danger`.
- **Fonts** — Manrope (headings) and Inter (body), loaded via Google Fonts in `src/index.css`.
- **Reusable** — `.card` and `.fade-in` utility classes in `src/index.css`.

## Backend

The frontend depends on a separate backend service exposing the `/api/*` endpoints above. It is **not** part of this repo.
