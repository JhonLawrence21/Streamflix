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
  const movies = await Movie.findAll({ limit: 5, raw: true });
  res.json({ count: movies.length, movies });
});

router.get('/seed', async (req, res) => {
  const sampleMovies = [
    {
      title: "The Action Hero",
      description: "An epic adventure of a hero who must save the world.",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400",
      category: "Action",
      genre: JSON.stringify(["Action", "Adventure"]),
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
      genre: JSON.stringify(["Comedy"]),
      rating: 7.8,
      duration: "1h 45m",
      releaseYear: 2024,
      director: "Jane Director",
      featured: false
    }
  ];
  
  try {
    const created = await Movie.bulkCreate(sampleMovies);
    res.json({ message: 'Movies seeded', count: created.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/featured', getFeaturedMovie);
router.get('/trending', getTrendingMovies);
router.get('/category/:category', getMoviesByCategory);
router.get('/similar/:id', getSimilarMovies);
router.get('/watch/:id', watchMovie);
router.get('/', getMovies);
router.get('/:id', getMovie);

module.exports = router;
