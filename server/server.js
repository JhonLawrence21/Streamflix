require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');
const passport = require('./config/googleAuth');

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

const app = express();

const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5000']
  : ['http://localhost:3000', 'http://localhost:5000'];

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });
      if (!existingAdmin) {
        await User.create({
          name: 'Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
          isVerified: true
        });
        console.log(`[Admin] Created: ${adminEmail}`);
      } else if (!existingAdmin.isVerified || existingAdmin.role !== 'admin') {
        existingAdmin.isVerified = true;
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[Admin] Verified & promoted: ${adminEmail}`);
      }
    }

    // Also verify any other admin accounts in the database
    const allAdmins = await User.findAll({ where: { role: 'admin' } });
    for (const admin of allAdmins) {
      if (!admin.isVerified) {
        admin.isVerified = true;
        await admin.save();
        console.log(`[Admin] Auto-verified: ${admin.email}`);
      }
    }
  } catch (error) {
    console.error('[Admin] Error:', error);
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
app.use(express.json());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, '../client/build'), {
  maxAge: '1m',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// API Routes - auth has stricter limiter for login/register, others use general
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/movies', generalLimiter, movieRoutes);
app.use('/api/watchlist', generalLimiter, watchlistRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);

// Test endpoint to check movies
app.get('/test-movies', async (req, res) => {
  try {
    const movies = await Movie.findAll({ raw: true });
    res.json(movies.map(m => ({ id: m.id, title: m.title, thumbnail: m.thumbnail })));
  } catch (e) {
    res.json({ error: e.message });
  }
});

// Health check endpoint - shows DB status and movie count
app.get('/api/health', async (req, res) => {
  try {
    const movieCount = await Movie.count();
    const userCount = await User.count();
    const dbType = process.env.DATABASE_URL ? 'postgresql' : (process.env.MYSQL_HOST ? 'mysql' : (process.env.PGHOST ? 'postgres' : 'sqlite'));
    res.json({
      status: 'ok',
      database: dbType,
      movies: movieCount,
      users: userCount,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

connectDB()
  .then(() => {
    console.log('Database connected successfully');
    return createDefaultAdmin();
  })
  .then(() => {
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`StreamFlix running on port ${PORT}`);
      console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
    });
  })
  .catch(err => {
    console.error('Startup error:', err.message);
    const PORT = process.env.PORT || 10000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`StreamFlix running on port ${PORT} (DB not connected)`);
    });
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});