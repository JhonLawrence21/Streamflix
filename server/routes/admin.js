const express = require('express');
const router = express.Router();
const {
  createMovie,
  updateMovie,
  deleteMovie,
  getAllMovies,
  createCategory,
  deleteCategory,
  getCategories,
  getUsers,
  updateUser,
  deleteUser,
  getAnalytics
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.use(protect);
router.use(admin);

router.get('/movies', getAllMovies);
router.post('/movies', createMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.delete('/categories/:id', deleteCategory);

router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/analytics', getAnalytics);

module.exports = router;