const User = require('../models/User');
const { logActivity } = require('../services/activityLogger');

const parseJsonField = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const processMovie = (movie) => {
  if (!movie) return movie;
  return {
    ...movie,
    genre: parseJsonField(movie.genre),
    cast: parseJsonField(movie.cast)
  };
};

exports.getWatchlist = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let watchlistIds = user.watchlist || [];
    if (typeof watchlistIds === 'string') {
      try {
        watchlistIds = JSON.parse(watchlistIds);
      } catch {
        watchlistIds = [];
      }
    }
    if (!Array.isArray(watchlistIds)) {
      watchlistIds = [];
    }

    if (watchlistIds.length === 0) {
      return res.json([]);
    }

    const { sequelize } = require('../config/db');
    const placeholders = watchlistIds.map(() => '?').join(',');
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id IN (${placeholders})`, { replacements: watchlistIds });

    res.json(movies.map(processMovie));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToWatchlist = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    if (isNaN(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT id, title FROM movies WHERE id = ? LIMIT 1`, { replacements: [movieId] });

    if (movies.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const user = await User.findByPk(req.user.id);
    let watchlist = user.watchlist || [];
    if (typeof watchlist === 'string') {
      try { watchlist = JSON.parse(watchlist); } catch { watchlist = []; }
    }

    if (watchlist.includes(movieId)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    watchlist.push(movieId);
    user.watchlist = watchlist;
    await user.save();

    try {
      logActivity(req.user.id, req.user.name, 'watchlist', `Added "${movies[0].title}" to watchlist`, { movieId, movieTitle: movies[0].title });
    } catch (e) { /* ignore */ }

    const [fullMovies] = await sequelize.query(`SELECT * FROM movies WHERE id IN (?)`, { replacements: [watchlist] });
    res.json(fullMovies.map(processMovie));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    if (isNaN(movieId)) {
      return res.status(400).json({ message: 'Invalid movie ID' });
    }

    const user = await User.findByPk(req.user.id);
    let watchlist = user.watchlist || [];
    if (typeof watchlist === 'string') {
      try { watchlist = JSON.parse(watchlist); } catch { watchlist = []; }
    }

    user.watchlist = watchlist.filter(id => id !== movieId);
    await user.save();

    try {
      const { sequelize } = require('../config/db');
      const [movieRows] = await sequelize.query(`SELECT title FROM movies WHERE id = ? LIMIT 1`, { replacements: [movieId] });
      if (movieRows.length > 0) {
        logActivity(req.user.id, req.user.name, 'watchlist', `Removed "${movieRows[0].title}" from watchlist`, { movieId, movieTitle: movieRows[0].title });
      }
    } catch (e) { /* ignore */ }

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
