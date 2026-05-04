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
  const movies = await Movie.findAll({ limit: 5 });
  res.json({ count: movies.length, movies });
});

router.get('/featured', getFeaturedMovie);
router.get('/trending', getTrendingMovies);
router.get('/popular', getPopularMovies);
router.get('/category/:category', getMoviesByCategory);
router.get('/similar/:id', getSimilarMovies);
router.get('/upcoming', getUpcomingReleases);
router.get('/releases/:year/:month', getReleasesByMonth);
router.get('/watch/:id', watchMovie);
router.get('/', getMovies);
router.get('/:id', getMovie);

module.exports = router;
