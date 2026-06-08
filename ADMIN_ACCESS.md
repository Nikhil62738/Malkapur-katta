# Admin Access & Roles

Malkapur Katta uses a **MongoDB-backed** admin panel. There is **no Firebase** — all
data (news, events, places, businesses, gallery, videos, polls, contact messages,
submissions, notifications, settings, about) lives in MongoDB and is managed from
the admin panel by default. The frontend talks only to the Node/Express + MongoDB
backend in `server/`.

## Where to log in

- Admin panel is **separate from the main site**: go to `/admin` (e.g.
  `http://localhost:5173/admin`). There is no admin login on the public pages.

## Roles

### Super Admin (owner)

Seeded automatically on first backend start from your `.env`:

- Email: `ADMIN_EMAIL` (default `admin@malkapurkatta.com`)
- Password: `ADMIN_PASSWORD` (default `Admin@12345`)

The super admin has access to **every** section and can manage sub-admins.

### Sub-Admins (partial access)

The super admin can create additional admins and grant them access to only the
sections you choose. Manage them at **`/admin/subadmins`** (visible only to the
super admin).

Grantable sections:

| Permission     | Controls                                   |
| -------------- | ------------------------------------------ |
| `home`         | Home page hero, headlines & layout         |
| `news`         | News articles                              |
| `explore`      | Explore Malkapur places                    |
| `events`       | Events & festivals                         |
| `businesses`   | Business directory                         |
| `videos`       | Videos & reels                             |
| `gallery`      | Photo gallery                              |
| `about`        | About page & team                          |
| `contact`      | Contact info & visitor messages            |
| `submissions`  | Citizen reporter submissions               |
| `notifications`| Push & site notifications                  |
| `settings`     | General site settings                      |

A sub-admin only sees the sidebar items they have permission for, and the backend
also enforces these permissions on every read/write — so they cannot change
sections they were not granted, even via the API.

## How permissions are enforced

- On login the backend issues a JWT that embeds the account's `role` and
  `permissions`.
- `server/src/routes/db.js` checks the permission required for each collection on
  every write (and on admin-only reads). Super admins bypass these checks.
- The `admins` collection (which stores password hashes) is never exposed through
  the generic data API; sub-admins are managed only via `/api/auth/admins`.

## Running locally

```bash
# Backend
cd server
cp .env.example .env   # set MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, Cloudinary...
npm install
npm run seed           # seeds the super admin + default content
npm run dev

# Frontend (in a second terminal, from the project root)
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:5000
npm install
npm run dev
```

> Note: run a fresh `npm install` in both the project root and `server/` so the
> correct platform binaries are installed for your machine.
