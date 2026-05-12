const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const {
  getMovies,
  getMovie,
  watchMovie,
  getFeaturedMovie,
  getTrendingMovies,
  getPopularMovies,
  getMoviesByCategory,
  getSimilarMovies,
  getUpcomingReleases,
  getReleasesByMonth
} = require('../controllers/movieController');

router.get('/test', async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query('SELECT * FROM movies LIMIT 5');
    res.json({ count: movies.length, movies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/featured', getFeaturedMovie);
router.get('/trending', getTrendingMovies);
router.get('/popular', getPopularMovies);
router.get('/category/:category', getMoviesByCategory);
router.get('/similar/:id', getSimilarMovies);
router.get('/upcoming', getUpcomingReleases);
router.get('/releases/:year/:month', getReleasesByMonth);
router.get('/categories', async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    
    try {
      await sequelize.query('CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, description TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())');
    } catch (e) { console.log('Create categories table:', e.message); }
    
    try {
      const tableInfo = await sequelize.getQueryInterface().describeTable('categories');
      if (tableInfo && !tableInfo.color) {
        await sequelize.query('ALTER TABLE categories ADD COLUMN color VARCHAR(255) DEFAULT \'#E50914\'');
      }
    } catch (e) { console.log('Categories column check:', e.message); }
    
    const [categories] = await sequelize.query('SELECT * FROM categories ORDER BY id ASC');
    console.log('[GET /categories] Found categories:', categories?.length, categories?.map(c => c.name));
    
    if (!categories || categories.length === 0) {
      const defaultCategories = [
        { name: 'Action', description: 'High-octane action movies', color: '#E50914' },
        { name: 'Comedy', description: 'Hilarious comedies', color: '#FFA500' },
        { name: 'Drama', description: 'Compelling dramas', color: '#4169E1' },
        { name: 'Horror', description: 'Hair-raising horror', color: '#8B0000' },
        { name: 'Sci-Fi', description: 'Mind-bending science fiction', color: '#00CED1' },
        { name: 'Thriller', description: 'Edge-of-your-seat thrillers', color: '#1C1C1C' },
        { name: 'Romance', description: 'Heartwarming love stories', color: '#FF69B4' },
        { name: 'TV Shows', description: 'Binge-worthy TV series', color: '#32CD32' }
      ];
      
      for (const cat of defaultCategories) {
        try {
          await sequelize.query(`INSERT INTO categories (name, description, color, "createdAt", "updatedAt") VALUES ('${cat.name}', '${cat.description}', '${cat.color}', NOW(), NOW())`);
        } catch (e) { }
      }
      
      const [newCategories] = await sequelize.query('SELECT * FROM categories ORDER BY name ASC');
      return res.json(newCategories || []);
    }
    
    res.json(categories || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/watch/:id', watchMovie);
router.get('/', getMovies);
router.get('/:id', getMovie);

module.exports = router;
