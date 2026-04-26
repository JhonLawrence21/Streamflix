require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Category = require('./models/Category');

const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');
const watchlistRoutes = require('./routes/watchlist');
const adminRoutes = require('./routes/admin');

const app = express();

const sampleCategories = [
  { name: "Action" }, { name: "Comedy" }, { name: "Drama" },
  { name: "Horror" }, { name: "Sci-Fi" }, { name: "Thriller" }, { name: "Romance" }
];

const sampleMovies = [
  {
    title: "The Action Hero",
    description: "An epic adventure of a hero who must save the world.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400",
    category: "Action",
    genre: '["Action","Adventure"]',
    rating: 8.5,
    duration: "2h 15m",
    releaseYear: 2024,
    director: "John Director",
    featured: true
  },
  {
    title: "Comedy Night",
    description: "A hilarious comedy that will keep you laughing.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1536440132201-1d93iW3roh1g?w=400",
    category: "Comedy",
    genre: '["Comedy"]',
    rating: 7.8,
    duration: "1h 45m",
    releaseYear: 2024,
    director: "Jane Director",
    featured: false
  },
  {
    title: "Dark Drama",
    description: "A compelling drama that explores human emotion.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1518676591709-ec05fabc79a2?w=400",
    category: "Drama",
    genre: '["Drama"]',
    rating: 9.0,
    duration: "2h 30m",
    releaseYear: 2023,
    director: "Bob Director",
    featured: false
  }
];

const seedDatabase = async () => {
  try {
    const movieCount = await Movie.count();
    console.log('>>> Movie count in DB:', movieCount);
    if (movieCount === 0) {
      console.log('>>> Seeding sample movies...');
      await Category.bulkCreate(sampleCategories, { ignoreDuplicates: true });
      await Movie.bulkCreate(sampleMovies);
      console.log('>>> Sample movies seeded!');
    } else {
      console.log('>>> Movies already exist, skipping seed');
    }
  } catch (error) {
    console.error('>>> Error seeding:', error);
  }
};

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

connectDB().then(() => {
  createDefaultAdmin();
  seedDatabase();
});

// Middleware
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5000']
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/admin', adminRoutes);

// Test endpoint
app.get('/db-check', async (req, res) => {
  try {
    const movies = await Movie.findAll({ raw: true });
    res.json({ movieCount: movies.length, movies: movies.map(m => ({ id: m.id, title: m.title })) });
  } catch (e) {
    res.json({ error: e.message });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`StreamFlix running on port ${PORT}`);
});
