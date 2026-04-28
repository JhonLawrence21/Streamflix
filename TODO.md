# Fix Plan: Movie Persistence & Thumbnail Images

## Issues Identified
1. **Movies disappear** — `server/seed.js` wipes the database with `destroy({truncate:true})`. Public `/seed` endpoint also exists.
2. **Images won't load** — Dead `via.placeholder.com` fallback, broken Unsplash URL in seed data, CSS `background-image` has no error handling.
3. **Can't enter any thumbnail link** — Admin form uses `type="url"` which blocks valid links.
4. **"Too many requests" error** — Rate limiter was 100 req/15min shared across ALL routes.
5. **DB connection may fail silently** — No retry logic, unclear which DB is being used.

## Steps (All Completed)
- [x] 1. Fix `server/seed.js` — make idempotent, remove destructive wipe, fix broken Unsplash URL
- [x] 2. Fix `server/routes/movies.js` — remove public `/seed` endpoint
- [x] 3. Fix `client/src/utils/imageUtils.js` — replace dead placeholder service
- [x] 4. Fix `client/src/pages/admin/AdminMoviesPage.jsx` — change thumbnail input to `type="text"`
- [x] 5. Fix `client/src/components/home/HeroBanner.jsx` — add image error fallback for background
- [x] 6. Fix `client/src/pages/MovieDetailsPage.jsx` — add image error fallback for background
- [x] 7. Fix `server/server.js` — increase rate limits (1000 general, 50 auth), add `/api/health` endpoint
- [x] 8. Fix `server/config/db.js` — add retry logic and better connection logging

