# Video Playlist TODO

## Fixes Completed ✅
- [x] Fix `server/controllers/adminController.js` — remove unnecessary JSON.stringify for genre/cast
- [x] Fix `server/controllers/movieController.js` — handle genre as array or string in getSimilarMovies
- [x] Fix `client/src/pages/admin/AdminMoviesPage.jsx` — add cast to form state and UI
- [x] Fix `client/src/pages/WatchPage.jsx` — external URL iframe → open in new tab button
- [x] Fix `client/src/pages/MovieDetailsPage.jsx` — add external link button
- [x] Fix `client/src/pages/LoginPage.jsx` — remove pre-filled credentials (autoComplete + readOnly trick)

## Render Deployment Ready ✅
- [x] `server/config/db.js` — added SQLite/PostgreSQL support with fallback
- [x] `server/package.json` — added pg, pg-hstore, sqlite3 dependencies
- [x] `server/server.js` — updated CORS to use CLIENT_URL env var
- [x] `package.json` — changed start script for production, added engines
- [x] `.env.example` — created with all required environment variables
- [x] `render.yaml` — created for one-click Render deployment

## Deployment Instructions

### Option 1: Deploy to Render (Recommended)
1. Push code to GitHub
2. In Render Dashboard → "New Web Service"
3. Connect your GitHub repo
4. Render will auto-detect `render.yaml` settings
5. Set environment variables from `.env.example`
6. Deploy!

### Option 2: Manual Deploy with SQLite (Easiest)
Set these environment variables in Render:
- `USE_SQLITE=true`
- `JWT_SECRET=your-random-secret`
- `NODE_ENV=production`

### Option 3: Deploy with PostgreSQL (Production)
1. Create PostgreSQL database in Render
2. Copy `DATABASE_URL` from database settings
3. Set `DATABASE_URL` in web service environment variables
4. Remove `USE_SQLITE` or set to `false`

## Local Development
```bash
npm run install:all
npm run dev
```

