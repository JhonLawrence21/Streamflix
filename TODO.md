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
- [x] 9. Add `trending` field to `server/models/Movie.js` schema
- [x] 10. Fix `server/controllers/movieController.js` — `getTrendingMovies` prioritizes `trending: true` flag
- [x] 11. Fix `server/config/db.js` — auto-migrate `trending` column if missing
- [x] 12. Add "TV Shows" category to `server/seed.js` with sample show
- [x] 13. Fix `client/src/pages/HomePage.jsx` — add `tvShows` state and "TV Shows" MovieRow
- [x] 14. Fix `client/src/pages/admin/AdminMoviesPage.jsx` — add trending checkbox, genre tags in table, genre badges
- [x] 15. Fix `client/src/pages/MovieDetailsPage.jsx` — display genre tags

## Summary of All Fixes

### 1. Movies Now Persist Permanently
- `seed.js` no longer wipes data — checks `Movie.count()` first
- Public `/seed` endpoint removed from `movies.js`
- DB connection has 3-retry logic with clear logging

### 2. Thumbnail Images Load Properly
- Dead `via.placeholder.com` replaced with working `placehold.co`
- HeroBanner and MovieDetails use `<img>` with `onError` fallback
- Admin thumbnail input changed from `type="url"` to `type="text"` — accepts any link

### 3. No More "Too Many Requests"
- General API limit: 1000 requests / 15 min
- Auth limit (login/register): 50 requests / 15 min
- `/api/health` endpoint added for status checks

### 4. Manual Trending Control
- Added `trending` boolean field to Movie model
- Admin can check "Show in Trending Now" checkbox
- `getTrendingMovies()` fetches `trending: true` first, falls back to most-viewed

### 5. TV Shows Category Added
- "TV Shows" added to seed categories
- Sample show "Mystery Manor" seeded with `trending: true`
- HomePage displays "TV Shows" row

### 6. Genre Tags Visible
- Admin table shows genre badges for each movie
- MovieDetails page displays genre tags
- Featured/Trending badges shown in admin table

