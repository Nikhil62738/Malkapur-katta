# Malkapur Katta — Digital Voice of Malkapur

A local community & news portal for Malkapur (Buldhana, Maharashtra) with a
separate **Admin Panel**. The public website is unchanged; an admin user signs in
at **`/admin`** to manage all content.

- **Frontend:** React 19 + Vite 6 + Tailwind CSS 3 (TypeScript)
- **Backend:** Node.js + Express + MongoDB (Mongoose), JWT auth
- **Media uploads:** Cloudinary

> The original front end was kept as-is. Instead of Firebase, the app now talks
> to the bundled Express + MongoDB backend through a small compatibility layer
> in `src/lib/fbshim/` that Vite aliases in place of the `firebase/*` packages
> (see `vite.config.ts`). The `firebase` npm package is kept only so TypeScript
> types resolve; no real Firebase project is needed.

---

## Prerequisites

- **Node.js 18+** and npm
- **MongoDB** running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI
- (Optional) a **Cloudinary** account for image/video uploads

---

## 1. Backend (`server/`)

```bash
cd server
cp .env.example .env        # then edit values (see below)
npm install
npm run seed                # one-time: creates the admin user + demo content
npm start                   # starts the API on http://localhost:5000
```

### Backend environment (`server/.env`)

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/malkapur_katta` |
| `JWT_SECRET` | Secret used to sign admin tokens | _set your own_ |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:5173` |
| `ADMIN_EMAIL` | Default admin login | `admin@malkapurkatta.com` |
| `ADMIN_PASSWORD` | Default admin password | `Admin@12345` |
| `ADMIN_NAME` | Admin display name | `Admin` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials (optional) | _empty_ |
| `CLOUDINARY_FOLDER` | Upload folder | `malkapur-katta` |

> **Change `ADMIN_PASSWORD` and `JWT_SECRET` before deploying.** Uploads stay
> disabled until Cloudinary credentials are filled in.

---

## 2. Frontend (project root)

```bash
cp .env.example .env        # sets VITE_API_BASE_URL
npm install
npm run dev                 # http://localhost:5173
```

### Frontend environment (`.env`)

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000` |

---

## 3. Using the Admin Panel

1. Open **`http://localhost:5173/admin`** (the admin area is completely separate
   from the public site — there is no admin login link on the main pages).
2. Sign in with the seeded credentials:
   - **Email:** `admin@malkapurkatta.com`
   - **Password:** `Admin@12345`
3. Manage Home, News, Explore, Events, Businesses, Videos & Reels, Gallery,
   About, Contact messages, Submissions, Notifications, and Settings.

The admin UI reuses the main website's theme (brand orange `#FF6B00` on a dark
surface) so it feels native to the site.

---

## Production build

```bash
npm run build      # tsc -b && vite build  ->  dist/
npm run preview    # preview the production build locally
```

Serve the built `dist/` behind any static host. Because the app is a single-page
app using client-side routing, configure your host to **fall back to
`index.html`** for unknown routes (so `/admin/...` deep links work). Point
`VITE_API_BASE_URL` at your deployed backend before building.

---

## Project structure

```
.
├── src/                 # React frontend (unchanged public site + admin pages)
│   ├── pages/admin/     # Admin panel screens
│   ├── context/         # Auth + content providers
│   └── lib/fbshim/      # Firebase-compatible REST adapter -> Express backend
├── server/              # Express + MongoDB backend (API, auth, uploads, seed)
├── public/              # Static assets (logo, reels, icons)
├── vite.config.ts       # Aliases firebase/* to src/lib/fbshim/*
└── .env.example         # Frontend env template
```

## Notes & known limitations

- **Web push (FCM)** is intentionally stubbed out (`isSupported()` returns
  `false`). In-app web notifications still work.
- Real-time updates are emulated by light polling (~12s) in the REST adapter,
  which is fine for this content volume.
- This package ships **without** `node_modules`. Run `npm install` in both the
  root and `server/` directories before first use.
