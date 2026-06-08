# Malkapur Katta — Edit/Delete + Fetch Fixes & Test Matrix

## What was broken and why

### Bug 1 — "some data cannot be edited or deleted" from the admin panel
Gallery, Explore (places), Business, and Videos admin pages showed **static placeholder
rows** whenever their MongoDB collection was empty. Those placeholder rows carried
hard-coded ids (`1`, `2`, ...) copied from `src/data/content.ts` — ids that do **not**
exist in MongoDB. So:
- **Delete** sent `DELETE /api/db/<col>/<fake-id>` → matched nothing → the row reappeared on the next poll.
- **Edit** sent a write to a non-existent id → it either created a junk document or appeared to "not save".
- Videos was worse: it **auto-seeded** the mock list into MongoDB (with malformed `${...}` video URLs), permanently polluting the collection.

### Bug 2 — "data added to MongoDB but not fetched by the main website"
Two causes:
1. **Reels feed crash.** `ContentContext.finalReels` called `item.videoUrl.startsWith('/reels/')`. Any reel document without a `videoUrl` threw a `TypeError`, which broke the entire reels render on the public site (and could cascade to the section).
2. The placeholder rows above made the **admin panel disagree with the public site**: admins saw fake rows that the public site (which reads only real MongoDB data) never showed.

## Fixes applied (frontend only — backend CRUD/auth were already correct)
| File | Change |
|---|---|
| `src/pages/admin/GalleryManagement.tsx` | Removed empty-collection static fallback; always mirror MongoDB. |
| `src/pages/admin/ExploreManagement.tsx` | Removed empty-collection static fallback; always mirror MongoDB. |
| `src/pages/admin/BusinessManagement.tsx` | Removed empty-collection static fallback; always mirror MongoDB. |
| `src/pages/admin/VideosManagement.tsx` | Removed mock auto-seed + in-memory fallback; always mirror MongoDB. Cleaned unused `useRef`/`writeBatch`. |
| `src/context/ContentContext.tsx` | Guarded `videoUrl` (`(item.videoUrl \|\| '')`) so reels never crash the public feed. |

## Automated tests run
- **TypeScript build:** `tsc -b` → 0 errors.
- **Backend logic suite:** `node server/src/__tests__/logic.test.mjs` → **43/43 passed**, covering:
  - `requiredPermission` mapping for every collection (incl. `places→explore`, `settings/home→home`, `settings/contact→contact`).
  - Superadmin can edit/delete every collection.
  - Sub-admins are allowed/denied strictly by granted permissions.
  - Anonymous users cannot write content.
  - `deepMerge`: partial edits keep untouched fields, nested merge, arrays replace, `increment`/`arrayUnion`/`arrayRemove` sentinels, `null` clears.

## Manual end-to-end test matrix (run on the live site after redeploy)
Log in at `/admin` as the owner (superadmin).

| # | Section | Action | Expected |
|---|---|---|---|
| 1 | News | Add article | Appears in admin list AND on the News page within ~12s. |
| 2 | News | Edit title/image | Change persists after refresh and on public site. |
| 3 | News | Delete | Row disappears and does NOT reappear. |
| 4 | Events | Add / edit / delete | Same as News, reflected on Events page. |
| 5 | Explore (places) | Add / edit / delete | Row persists/removes; reflected on Explore page. |
| 6 | Business | Add / edit / delete | Row persists/removes; reflected on Business directory. |
| 7 | Gallery | Add / delete image | Image persists/removes; reflected on Gallery. |
| 8 | Videos (YouTube) | Add / edit / delete | Plays on Videos page; no `${...}` URLs. |
| 9 | Reels (Instagram) | Add a reel WITHOUT a video URL | Reels feed still renders (no crash). |
| 10 | Home settings | Edit hero/headlines | Reflected on Home page. |
| 11 | Contact settings | Edit contact info | Reflected on Contact page. |
| 12 | About | Edit content | Reflected on About page. |
| 13 | Sub-admin | Create sub-admin with only `gallery` | Can edit Gallery; Gallery-only sidebar; blocked elsewhere (401). |
| 14 | Empty collection | View a section before seeding | Shows empty state (NOT fake placeholder rows). |
| 15 | Contact form | Submit from public site | Appears in admin Contact Messages. |

## Important: seed the database once
Because the admin panel no longer invents placeholder rows, **empty collections show as empty**.
Populate the initial content once on the server (Render → your service → Shell):
```
npm run seed
```
This loads the default news/events/places/businesses/gallery/videos/polls + settings + about
into MongoDB. After that, everything you add/edit/delete in the admin panel is the single
source of truth for the public website.
