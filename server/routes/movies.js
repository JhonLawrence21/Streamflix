const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovie,
  watchMovie,
  getFeaturedMovie,
  getTrendingMovies,
  getMoviesByCategory,
  getSimilarMovies
} = require('../controllers/movieController');

router.get('/', getMovies);
router.get('/featured', getFeaturedMovie);
router.get('/trending', getTrendingMovies);
router.get('/category/:category', getMoviesByCategory);
router.get('/similar/:id', getSimilarMovies);
router.get('/watch/:id', watchMovie);
router.get('/:id', getMovie);

module.exports = router;
