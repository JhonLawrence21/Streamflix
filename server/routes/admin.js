const express = require('express');
const router = express.Router();
const {
  createMovie,
  updateMovie,
  deleteMovie,
  getAllMovies,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  getUsers,
  updateUser,
  deleteUser,
  getAnalytics
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const User = require('../models/User');
const Movie = require('../models/Movie');

router.use(protect);
router.use(admin);

router.get('/movies', getAllMovies);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/users/:id/watchlist', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const watchlistIds = user.watchlist || [];
    const movies = await Movie.findAll({
      where: { id: watchlistIds }
    });
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users/:id/history', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const history = user.viewingHistory || [];
    const historyWithMovies = await Promise.all(
      history.map(async (item) => {
        const movie = await Movie.findByPk(item.movieId);
        return {
          ...item,
          movie: movie ? {
            id: movie.id,
            title: movie.title,
            thumbnail: movie.thumbnail
          } : null
        };
      })
    );
    res.json(historyWithMovies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/analytics', getAnalytics);

module.exports = router;