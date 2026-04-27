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
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later.' }
});

app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/movies', apiLimiter, movieRoutes);
app.use('/api/watchlist', apiLimiter, watchlistRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);

// Test endpoint to check movies
app.get('/test-movies', async (req, res) => {
  try {
    const movies = await Movie.findAll({ raw: true });
    res.json(movies.map(m => ({ id: m.id, title: m.title, thumbnail: m.thumbnail })));
  } catch (e) {
    res.json({ error: e.message });
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
  .then(() => {
    console.log('Database connected successfully');
    createDefaultAdmin();
  })
  .catch(err => {
    console.error('DB connection error:', err.message);
  });

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});