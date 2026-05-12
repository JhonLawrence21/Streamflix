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
    const { Sequelize } = require('sequelize');
    const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
    const [movies] = await sequelize.query('SELECT * FROM movies LIMIT 5');
    await sequelize.close();
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
    
    const [categories] = await sequelize.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get('/watch/:id', watchMovie);
router.get('/', getMovies);
router.get('/:id', getMovie);

module.exports = router;
