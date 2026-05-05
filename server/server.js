require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

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
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  
  try {
    const adminExists = await User.findOne({ where: { email: process.env.ADMIN_EMAIL } });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log(`Admin created: ${process.env.ADMIN_EMAIL}`);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
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

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/movies', generalLimiter, movieRoutes);
app.use('/api/watchlist', generalLimiter, watchlistRoutes);
app.use('/api/admin', generalLimiter, adminRoutes);

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
    console.log('DB connected');
    await createDefaultAdmin();
    
    const movieCount = await Movie.count();
    if (movieCount === 0) {
      console.log('Seeding data...');
      await seedInitialData();
    }
  })
  .catch(console.error);

// seedInitialData function here (same as before)
async function seedInitialData() {
  // ... (keep original seed code)
  // Omitted for brevity, copy from original
}

process.on('unhandledRejection', (err) => console.error(err.message));
