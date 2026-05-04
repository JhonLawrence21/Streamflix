require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
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

const buildPath = path.join(__dirname, '../client/build');
if (require('fs').existsSync(buildPath)) {
  app.use(express.static(buildPath, {
    maxAge: '1m',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
    }
  }));
} else {
  console.warn('Warning: client/build folder not found. Static files will not be served.');
}

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

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`StreamFlix running on port ${PORT}`);
  console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
});

connectDB()
  .then(async () => {
    console.log('Database connected successfully');
    createDefaultAdmin();
    
    // Check if database is empty and seed if needed
    const movieCount = await Movie.count();
    const categoryCount = await Category.count();
    console.log(`Data check - Movies: ${movieCount}, Categories: ${categoryCount}`);
    
    if (movieCount === 0 && categoryCount === 0) {
      console.log('Database is empty, seeding initial data...');
      try {
        await seedInitialData();
        console.log('Seed completed successfully');
      } catch (err) {
        console.error('Seed error (non-fatal):', err.message);
      }
    }
  })
  .catch(err => {
    console.error('DB connection error:', err.message);
  });

// Seed function that uses already-connected models
async function seedInitialData() {
  const sampleCategories = [
    { name: "Action", description: "High-octane action movies with thrilling sequences" },
    { name: "Comedy", description: "Hilarious comedies to brighten your day" },
    { name: "Drama", description: "Compelling dramas that touch the heart" },
    { name: "Horror", description: "Hair-raising horror movies" },
    { name: "Sci-Fi", description: "Mind-bending science fiction" },
    { name: "Thriller", description: "Edge-of-your-seat thrillers" },
    { name: "Romance", description: "Heartwarming love stories" },
    { name: "TV Shows", description: "Binge-worthy TV series and shows" }
  ];

  const sampleMovies = [
    {
      title: "The Action Hero",
      description: "An epic adventure of a hero who must save the world from destruction.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400",
      category: "Action",
      genre: ["Action", "Adventure"],
      rating: 8.5,
      duration: "2h 15m",
      releaseYear: 2024,
      director: "John Director",
      featured: true,
      trending: true
    },
    {
      title: "Comedy Night",
      description: "A hilarious comedy that will keep you laughing all night.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1536440132201-1d93eW3roh1g?w=400",
      category: "Comedy",
      genre: ["Comedy"],
      rating: 7.8,
      duration: "1h 45m",
      releaseYear: 2024,
      director: "Jane Director",
      featured: false,
      trending: false
    },
    {
      title: "Dark Drama",
      description: "A compelling drama that explores the depths of human emotion.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1518676591709-ec05fabc79a2?w=400",
      category: "Drama",
      genre: ["Drama"],
      rating: 9.0,
      duration: "2h 30m",
      releaseYear: 2023,
      director: "Bob Director",
      featured: false,
      trending: false
    },
    {
      title: "Mystery Manor",
      description: "A gripping TV series following detectives solving impossible cases.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
      category: "TV Shows",
      genre: ["Mystery", "Thriller"],
      rating: 8.9,
      duration: "8 Episodes",
      releaseYear: 2024,
      director: "Sarah Showrunner",
      featured: false,
      trending: true
    }
  ];

  await Category.bulkCreate(sampleCategories);
  await Movie.bulkCreate(sampleMovies);
}

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});