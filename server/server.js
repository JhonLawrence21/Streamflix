require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

console.log('[ENV] CLIENT_URL:', process.env.CLIENT_URL || 'NOT SET');
console.log('[ENV] DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'streamflix_jwt_secret_key_2024_prod';
}

const isProduction = process.env.NODE_ENV === 'production';

const User = require('./models/User');
const Movie = require('./models/Movie');
const Category = require('./models/Category');

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const watchlistRoutes = require('./routes/watchlist');
const adminRoutes = require('./routes/admin');
const db = require('./config/db');
const recommendationRoutes = require('./routes/recommendations');

const app = express();

// Default to Render URL if CLIENT_URL not set
const renderUrl = 'https://streamflix-1-4gr5.onrender.com';
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5000']
  : [renderUrl, 'http://localhost:3000', 'http://localhost:5000'];

console.log('[CORS] Allowed origins:', allowedOrigins);

const createDefaultAdmin = async () => {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.log('[Admin] ADMIN_EMAIL or ADMIN_PASSWORD not set, skipping admin creation');
    return;
  }
  
  console.log('[Admin] Checking admin user...');
  
  try {
    const { Sequelize } = require('sequelize');
    const sequelize = new Sequelize(process.env.DATABASE_URL);
    
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profiles JSONB DEFAULT \'[{"id":"default","name":"Main Profile","avatar":"","isKid":false,"pin":""}]\'');
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "activeProfile" VARCHAR(255) DEFAULT \'default\'');
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "parentalControlPin" VARCHAR(255) DEFAULT \'\'');
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "viewingHistory" JSONB DEFAULT \'[]\'');
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS watchlist JSONB DEFAULT \'[]\'');
    
    await sequelize.query('ALTER TABLE movies ADD COLUMN IF NOT EXISTS "ageRating" VARCHAR(20) DEFAULT \'PG-13\'');
    await sequelize.query('ALTER TABLE movies ADD COLUMN IF NOT EXISTS "cast" JSONB DEFAULT \'[]\'');
    await sequelize.query('ALTER TABLE movies ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP DEFAULT NULL');
    
    await sequelize.query(`CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      color VARCHAR(20) DEFAULT '#E50914',
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )`);
    
    await sequelize.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT \'#E50914\'');
    
    const [results] = await sequelize.query(`SELECT * FROM users WHERE email = '${process.env.ADMIN_EMAIL}' LIMIT 1`);
    console.log('[Admin] Query result:', results ? results.length : 0);
    
    if (!results || results.length === 0) {
      console.log('[Admin] Creating admin user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      
      await sequelize.query(`INSERT INTO users (name, email, password, role, "profileImage", watchlist, profiles, "activeProfile", "parentalControlPin", "viewingHistory", "createdAt", "updatedAt") 
        VALUES ('Admin', '${process.env.ADMIN_EMAIL}', '${hashedPassword}', 'admin', '', '[]', '[{"id":"default","name":"Main Profile","avatar":"","isKid":false,"pin":""}]', 'default', '[]', '[]', NOW(), NOW())`);
      
      console.log(`Admin created: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('[Admin] Admin user already exists');
    }
    await sequelize.close();
  } catch (error) {
    console.error('Error creating admin:', error.message, error.stack);
  }
};

// Security Middleware
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { message: 'Too many login attempts, please try again later.' }
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["*", "data:", "https:"],
      mediaSrc: ["*", "data:", "https:"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "*"],
      scriptSrcElem: ["'self'", "'unsafe-inline'"]
    }
  }
}));
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/movies', generalLimiter, movieRoutes);
app.use('/api/watchlist', generalLimiter, watchlistRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);
app.use('/api/recommendations', generalLimiter, recommendationRoutes);

// Image proxy for blocked CDNs (Pinterest, etc)
app.get('/api/thumb', async (req, res) => {
   const url = req.query.url;
   if (!url) {
     return servePlaceholder(res);
   }
   try {
     const https = require('https');
     const http = require('http');
     const client = url.startsWith('https') ? https : http;
     client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (proxyRes) => {
       if (proxyRes.statusCode >= 400) {
         return servePlaceholder(res);
       }
       const contentType = proxyRes.headers['content-type'] || 'image/jpeg';
       if (!contentType.startsWith('image/')) {
         return servePlaceholder(res);
       }
       res.setHeader('Content-Type', contentType);
       res.setHeader('Cache-Control', 'public, max-age=86400');
       res.setHeader('Access-Control-Allow-Origin', '*');
       proxyRes.pipe(res);
     }).on('error', () => servePlaceholder(res));
   } catch {
     servePlaceholder(res);
   }
 });

 function servePlaceholder(res) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="#1C1C1C" width="300" height="450"/><text x="150" y="225" text-anchor="middle" fill="white" font-size="64" font-weight="bold" font-family="sans-serif">NP</text></svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.status(200).send(svg);
  }

// User report submission endpoint
const { optionalAuth } = require('./middleware/auth');
app.post('/api/reports', optionalAuth, async (req, res) => {
  try {
    const { type, movieId, movieTitle, message } = req.body;
    if (!type || !message) {
      return res.status(400).json({ message: 'Type and message are required' });
    }
    const { sequelize } = db;
    const now = new Date().toISOString();
    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : 'Anonymous';
    const safeType = `'${String(type).replace(/'/g, "''")}'`;
    const safeMsg = `'${String(message).replace(/'/g, "''")}'`;
    const safeTitle = movieTitle ? `'${String(movieTitle).replace(/'/g, "''")}'` : 'NULL';
    const safeMovieId = movieId != null ? movieId : 'NULL';
    const safeUserId = userId != null ? userId : 'NULL';
    const safeName = `'${String(userName).replace(/'/g, "''")}'`;

    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS user_reports (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          "movieId" INTEGER,
          "movieTitle" VARCHAR(255),
          "userId" INTEGER,
          "userName" VARCHAR(255),
          message TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (e) {
      try {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS user_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type VARCHAR(50) NOT NULL,
            "movieId" INTEGER,
            "movieTitle" VARCHAR(255),
            "userId" INTEGER,
            "userName" VARCHAR(255),
            message TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (e2) {}
    }

    await sequelize.query(`
      INSERT INTO user_reports (type, "movieId", "movieTitle", "userId", "userName", message, status, "createdAt", "updatedAt")
      VALUES (${safeType}, ${safeMovieId}, ${safeTitle}, ${safeUserId}, ${safeName}, ${safeMsg}, 'pending', '${now}', '${now}')
    `);

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Frontend static serve with fallbacks (client/build preferred over public/)
const possiblePaths = [
  path.join(__dirname, '..', '..', 'client', 'build'),
  path.join(process.cwd(), 'client', 'build'),
  path.join(__dirname, '..', 'public'),
  path.join(process.cwd(), 'public')
];
let staticPath = null;
for (const p of possiblePaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    staticPath = p;
    break;
  }
}
console.log(`Frontend build paths checked, using: ${staticPath || 'NONE'}`);
console.log(`__dirname: ${__dirname}`);
console.log(`cwd: ${process.cwd()}`);
if (staticPath) {
  const contents = fs.readdirSync(staticPath);
  console.log(`Contents: ${contents.slice(0, 5).join(', ')}${contents.length > 5 ? '...' : ''}`);
}

if (staticPath) {
  app.use(express.static(staticPath, {
    maxAge: '1m',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    }
  }));
} else {
  console.log('No static frontend path found, API only mode');
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const movieCount = await Movie.count();
    const userCount = await User.count();
    res.json({
      status: 'ok',
      movies: movieCount,
      users: userCount,
      frontend: !!staticPath
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// Test SQL direct
app.get('/api/test-sql', async (req, res) => {
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
  try {
    const [results] = await sequelize.query('SELECT COUNT(*) as cnt FROM movies');
    await sequelize.close();
    res.json({ count: results[0].cnt });
  } catch (e) {
    await sequelize.close();
    res.status(500).json({ error: e.message });
  }
});

// Debug endpoint to test movie queries
app.get('/api/debug/movies', async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const sequelize = new Sequelize(process.env.DATABASE_URL);
    const [movies] = await sequelize.query('SELECT * FROM movies LIMIT 5');
    await sequelize.close();
    res.json({ count: movies.length, movies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  if (staticPath) {
    const indexPath = path.join(staticPath, 'index.html');
    res.sendFile(indexPath);
  } else {
    res.status(503).json({ error: 'Frontend build missing - check deployment logs' });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StreamFlix API + Frontend on port ${PORT}`);
  console.log(`Mode: ${isProduction ? 'production' : 'development'}`);
});

connectDB()
  .then(async (db) => {
    if (!db) {
      console.log('✓ Server running without database (API endpoints will be limited)');
      return;
    }
    console.log('✓ DB connected successfully');
    await createDefaultAdmin().catch(e => console.error('Admin creation error:', e.message));
    
    try {
      const { ensureTable } = require('./services/activityLogger');
      await ensureTable();
    } catch (e) {
      console.log('Activity logger setup skipped:', e.message);
    }

    try {
      const movieCount = await Movie.count();
      console.log(`✓ Current movies in DB: ${movieCount}`);
      if (movieCount === 0) {
        console.log('Seeding initial data...');
        await seedInitialData();
      }
    } catch (e) {
      console.log('Movie count check skipped:', e.message);
    }

    // Scheduled publishing: auto-release movies whose releaseDate has passed
    const checkScheduledPublishing = async () => {
      try {
        const { sequelize } = require('./config/db');
        const now = new Date().toISOString();
        const [released] = await sequelize.query(
          `UPDATE movies SET status = 'released', "updatedAt" = '${now}' WHERE status = 'upcoming' AND "deletedAt" IS NULL AND "releaseDate" IS NOT NULL AND "releaseDate" <= '${now}'`
        );
        if (released?.affectedRows > 0 || released?.rowCount > 0) {
          const count = released?.affectedRows || released?.rowCount || 0;
          console.log(`[Scheduler] Auto-released ${count} movie(s)`);
        }
      } catch (e) {
        // silent
      }
    };
    checkScheduledPublishing();
    setInterval(checkScheduledPublishing, 60000); // check every minute
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    console.log('Continuing without database...');
  });

async function seedInitialData() {
  try {
    const sampleMovies = [
      { title: 'The Action Hero', description: 'An epic adventure of a hero who must save the world from destruction.', category: 'Action', genre: '["Action"]', thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400', videoUrl: '', rating: 4.5, views: 100 },
      { title: 'Comedy Night', description: 'A hilarious comedy that will keep you laughing all night.', category: 'Comedy', genre: '["Comedy"]', thumbnail: 'https://images.unsplash.com/photo-1536440132201-1d93eW3roh1g?w=400', videoUrl: '', rating: 4.0, views: 50 },
      { title: 'Dark Drama Series', description: 'An awesome series that explores the depths of human emotion.', category: 'Drama', genre: '["Drama"]', thumbnail: 'https://images.unsplash.com/photo-1518676591709-ec05fabc79a2?w=400', videoUrl: '', rating: 4.8, views: 200 },
      { title: 'Anime World', description: 'Best anime with breathtaking animation and compelling stories.', category: 'Action', genre: '["Adventure"]', thumbnail: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400', videoUrl: '', rating: 4.9, views: 500 },
      { title: 'K-Drama Love Story', description: 'Amazing drama that will make you laugh and cry.', category: 'Romance', genre: '["Romance"]', thumbnail: 'https://images.unsplash.com/photo-1518834109062-2a85f8b40207?w=400', videoUrl: '', rating: 4.7, views: 300 }
    ];
    
    for (const movie of sampleMovies) {
      await Movie.create(movie);
    }
    console.log('✓ Sample data seeded');
  } catch (e) {
    console.error('Seeding error:', e.message);
  }
}

process.on('unhandledRejection', (err) => console.error(err.message));
