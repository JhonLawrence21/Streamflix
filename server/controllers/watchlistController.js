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

const getWatchlistIds = async (sequelize, userId) => {
  const [rows] = await sequelize.query(`SELECT watchlist FROM users WHERE id = ? LIMIT 1`, { replacements: [userId] });
  if (!rows || rows.length === 0) return [];
  let val = rows[0].watchlist;
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
};

const setWatchlistIds = async (sequelize, userId, ids) => {
  const json = JSON.stringify(ids);
  const isPG = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));
  const now = isPG ? 'NOW()' : "datetime('now')";
  await sequelize.query(`UPDATE users SET watchlist = ?, "updatedAt" = ${now} WHERE id = ?`, { replacements: [json, userId] });
};

exports.getWatchlist = async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    const watchlistIds = await getWatchlistIds(sequelize, req.user.id);

    if (watchlistIds.length === 0) return res.json([]);

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
    if (isNaN(movieId)) return res.status(400).json({ message: 'Invalid movie ID' });

    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT id, title FROM movies WHERE id = ? LIMIT 1`, { replacements: [movieId] });
    if (movies.length === 0) return res.status(404).json({ message: 'Movie not found' });

    let watchlist = await getWatchlistIds(sequelize, req.user.id);
    if (watchlist.includes(movieId)) return res.status(400).json({ message: 'Movie already in watchlist' });

    watchlist.push(movieId);
    await setWatchlistIds(sequelize, req.user.id, watchlist);

    try {
      logActivity(req.user.id, req.user.name, 'watchlist', `Added "${movies[0].title}" to watchlist`, { movieId, movieTitle: movies[0].title });
    } catch (e) { /* ignore */ }

    const placeholders = watchlist.map(() => '?').join(',');
    const [fullMovies] = await sequelize.query(`SELECT * FROM movies WHERE id IN (${placeholders})`, { replacements: watchlist });
    res.json(fullMovies.map(processMovie));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    if (isNaN(movieId)) return res.status(400).json({ message: 'Invalid movie ID' });

    const { sequelize } = require('../config/db');
    let watchlist = await getWatchlistIds(sequelize, req.user.id);
    const filtered = watchlist.filter(id => id !== movieId);
    await setWatchlistIds(sequelize, req.user.id, filtered);

    try {
      const [movieRows] = await sequelize.query(`SELECT title FROM movies WHERE id = ? LIMIT 1`, { replacements: [movieId] });
      if (movieRows.length > 0) {
        logActivity(req.user.id, req.user.name, 'watchlist', `Removed "${movieRows[0].title}" from watchlist`, { movieId, movieTitle: movieRows[0].title });
      }
    } catch (e) { /* ignore */ }

    if (filtered.length > 0) {
      const placeholders = filtered.map(() => '?').join(',');
      const [fullMovies] = await sequelize.query(`SELECT * FROM movies WHERE id IN (${placeholders})`, { replacements: filtered });
      return res.json(fullMovies.map(processMovie));
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
