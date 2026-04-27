# Fix Plan: Movie Persistence & Thumbnail Images

## Issues Identified
1. **Movies disappear** — `server/seed.js` wipes the database with `destroy({truncate:true})`. Public `/seed` endpoint also exists.
2. **Images won't load** — Dead `via.placeholder.com` fallback, broken Unsplash URL in seed data, CSS `background-image` has no error handling.
3. **Can't enter any thumbnail link** — Admin form uses `type="url"` which blocks valid links.

## Steps (All Completed)
- [x] 1. Fix `server/seed.js` — make idempotent, remove destructive wipe, fix broken Unsplash URL
- [x] 2. Fix `server/routes/movies.js` — remove public `/seed` endpoint, fix broken Unsplash URL
- [x] 3. Fix `client/src/utils/imageUtils.js` — replace dead placeholder service
- [x] 4. Fix `client/src/pages/admin/AdminMoviesPage.jsx` — change thumbnail input to `type="text"`
- [x] 5. Fix `client/src/components/home/HeroBanner.jsx` — add image error fallback for background
- [x] 6. Fix `client/src/pages/MovieDetailsPage.jsx` — add image error fallback for background

