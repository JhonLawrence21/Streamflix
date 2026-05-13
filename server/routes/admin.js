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
const { getRecentActivity } = require('../services/activityLogger');
const db = require('../config/db');

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
    
    let watchlistIds = user.watchlist;
    if (typeof watchlistIds === 'string') { try { watchlistIds = JSON.parse(watchlistIds); } catch { watchlistIds = []; } }
    if (!Array.isArray(watchlistIds)) watchlistIds = [];

    const validIds = watchlistIds.filter(id => id != null);
    if (validIds.length === 0) return res.json([]);

    const [movies] = await require('../config/db').sequelize.query(
      `SELECT * FROM movies WHERE id IN (${validIds.join(',')})`
    );
    res.json(movies || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/users/:id/history', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    let history = user.viewingHistory;
    if (typeof history === 'string') { try { history = JSON.parse(history); } catch { history = []; } }
    if (!Array.isArray(history)) history = [];

    const historyWithMovies = await Promise.all(
      history.map(async (item) => {
        if (!item || !item.movieId) return item;
        try {
          const movie = await Movie.findByPk(item.movieId);
          return {
            ...item,
            movie: movie ? {
              id: movie.id,
              title: movie.title,
              thumbnail: movie.thumbnail
            } : null
          };
        } catch { return item; }
      })
    );
    res.json(historyWithMovies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const activities = await getRecentActivity(limit);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const { sequelize } = db;
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS user_reports (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          "movieId" INTEGER,
          "movieTitle" VARCHAR(255),
          "userId" INTEGER,
          "userName" VARCHAR(255),
          message TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `);
    } catch (e) {
      try {
        await sequelize.query(`
          CREATE TABLE IF NOT EXISTS user_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type VARCHAR(50) NOT NULL,
            "movieId" INTEGER,
            "movieTitle" VARCHAR(255),
            "userId" INTEGER,
            "userName" VARCHAR(255),
            message TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } catch (e2) {}
    }

    const filter = req.query.status || 'all';
    let query = 'SELECT * FROM user_reports';
    if (filter !== 'all') {
      query += ` WHERE status = '${filter.replace(/'/g, "''")}'`;
    }
    query += ' ORDER BY "createdAt" DESC';

    const [reports] = await sequelize.query(query);
    res.json(reports || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/reports/:id', async (req, res) => {
  try {
    const { sequelize } = db;
    const { status } = req.body;
    const id = parseInt(req.params.id);

    if (!['pending', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const now = new Date().toISOString();
    await sequelize.query(`
      UPDATE user_reports SET status = '${status}', "updatedAt" = '${now}' WHERE id = ${id}
    `);

    const [reports] = await sequelize.query(`SELECT * FROM user_reports WHERE id = ${id} LIMIT 1`);
    res.json(reports[0] || { message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const { sequelize } = db;
    const id = parseInt(req.params.id);
    await sequelize.query(`DELETE FROM user_reports WHERE id = ${id}`);
    res.json({ message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/analytics', getAnalytics);

module.exports = router;