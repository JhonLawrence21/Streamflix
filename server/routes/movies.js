const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const {
  getMovies,
  getMovie,
  watchMovie,
  getFeaturedMovie,
  getTrendingMovies,
  getMoviesByCategory,
  getSimilarMovies
} = require('../controllers/movieController');

router.get('/test', async (req, res) => {
  const movies = await Movie.findAll({ limit: 5 });
  res.json({ count: movies.length, movies });
});

router.get('/featured', getFeaturedMovie);
router.get('/trending', getTrendingMovies);
router.get('/category/:category', getMoviesByCategory);
router.get('/similar/:id', getSimilarMovies);
router.get('/watch/:id', watchMovie);
router.get('/', getMovies);
router.get('/:id', getMovie);

module.exports = router;
