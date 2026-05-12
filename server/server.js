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
// const recommendationRoutes = require('./routes/recommendations');

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
      imgSrc: ["'self'", "data:", "https:", "http:"],
      mediaSrc: ["'self'", "https:", "http:"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://youtube.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
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
// app.use('/api/recommendations', generalLimiter, recommendationRoutes);

// Frontend static serve with fallbacks
const possiblePaths = [
  path.join(__dirname, '..', 'public'),
  path.join(process.cwd(), 'public'),
  path.join(__dirname, '..', '..', 'client', 'build'),
  path.join(process.cwd(), 'client', 'build')
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
  .then(async () => {
    console.log('✓ DB connected successfully');
    await createDefaultAdmin();
    
    const movieCount = await Movie.count();
    console.log(`✓ Current movies in DB: ${movieCount}`);
    if (movieCount === 0) {
      console.log('Seeding initial data...');
      await seedInitialData();
    }
  })
  .catch(err => {
    console.error('✗ Database connection failed:', err.message);
    console.log('Continuing without database...');
  });

async function seedInitialData() {
  try {
    const sampleMovies = [
      { title: 'Sample Movie 1', description: 'A great movie', category: 'Movies', genre: '["Action"]', thumbnail: '', videoUrl: '', rating: 4.5, views: 100 },
      { title: 'Sample Movie 2', description: 'Another great movie', category: 'Movies', genre: '["Drama"]', thumbnail: '', videoUrl: '', rating: 4.0, views: 50 },
      { title: 'Sample Series 1', description: 'An awesome series', category: 'Series', genre: '["Comedy"]', thumbnail: '', videoUrl: '', rating: 4.8, views: 200 },
      { title: 'Sample Anime 1', description: 'Best anime', category: 'Anime', genre: '["Adventure"]', thumbnail: '', videoUrl: '', rating: 4.9, views: 500 },
      { title: 'Sample K-Drama 1', description: 'Amazing drama', category: 'K-Drama', genre: '["Romance"]', thumbnail: '', videoUrl: '', rating: 4.7, views: 300 }
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
