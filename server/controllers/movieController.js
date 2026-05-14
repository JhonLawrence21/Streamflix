const { Op } = require('sequelize');

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

const processMovies = (movies) => movies.map(processMovie);

exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT * FROM movies ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`);
    const [[{ count }]] = await sequelize.query('SELECT COUNT(*) as count FROM movies');
    

    res.json({
      movies: processMovies(movies),
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id = ${id} LIMIT 1`);
    
    
    if (movies.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(processMovie(movies[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.watchMovie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sequelize } = require('../config/db');
    
    await sequelize.query(`UPDATE movies SET views = views + 1 WHERE id = ${id}`);
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id = ${id} LIMIT 1`);
    
    
    if (movies.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    if (req.user) {
      try {
        const { logActivity } = require('../services/activityLogger');
        const movie = movies[0];
        logActivity(req.user.id, req.user.name, 'view', `Watched "${movie.title}"`, { movieId: movie.id, movieTitle: movie.title });
      } catch (e) { console.error('[watchMovie] activity log error:', e.message); }
    }

    res.json(processMovie(movies[0]));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedMovie = async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    let [movies] = await sequelize.query(`SELECT * FROM movies WHERE featured = true ORDER BY "createdAt" DESC LIMIT 1`);
    
    if (movies.length === 0) {
      [movies] = await sequelize.query(`SELECT * FROM movies ORDER BY views DESC LIMIT 1`);
    }
    
    
    res.json(movies.length > 0 ? processMovie(movies[0]) : null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrendingMovies = async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    let [movies] = await sequelize.query(`SELECT * FROM movies WHERE trending = true ORDER BY "createdAt" DESC LIMIT 10`);
    
    if (movies.length === 0) {
      [movies] = await sequelize.query(`SELECT * FROM movies ORDER BY views DESC LIMIT 10`);
    }
    
    
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT * FROM movies ORDER BY views DESC, rating DESC LIMIT ${limit}`);
    
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMoviesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { sequelize } = require('../config/db');
    console.log(`[getMoviesByCategory] Fetching movies for category: "${category}"`);
    
    const [movies] = await sequelize.query(
      `SELECT * FROM movies WHERE LOWER(category) = LOWER(?) ORDER BY "createdAt" DESC`,
      { replacements: [category] }
    );
    console.log(`[getMoviesByCategory] Found ${movies?.length} movies for "${category}"`);
    
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSimilarMovies = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sequelize } = require('../config/db');
    
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id != ${id} ORDER BY rating DESC LIMIT 10`);
    
    
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUpcomingReleases = async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE status = 'upcoming' OR "releaseDate" > NOW() ORDER BY "releaseDate" ASC LIMIT 20`);
    
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.browseMovies = async (req, res) => {
  try {
    const { type, genre, country, year } = req.query;
    const { sequelize } = require('../config/db');

    let query = 'SELECT * FROM movies WHERE 1=1';
    const replacements = [];

    if (type) {
      query += ' AND type = ?';
      replacements.push(type);
    }

    if (genre && genre !== 'All') {
      if (genre === 'Other') {
        query += " AND (genre IS NULL OR genre = '[]' OR genre = '')";
      } else {
        query += ' AND genre LIKE ?';
        replacements.push(`%"${genre}"%`);
      }
    }

    if (country && country !== 'All') {
      if (country === 'Other') {
        const known = ['United States', 'United Kingdom', 'Korea', 'Japan', 'Bangladesh', 'China', 'Egypt', 'France', 'Germany', 'India', 'Indonesia', 'Iraq', 'Italy', 'Ivory Coast', 'Kenya', 'Lebanon', 'Mexico', 'Morocco', 'Nigeria', 'Pakistan', 'Philippines', 'Russia', 'Saudi Arabia', 'South Africa', 'Spain', 'Syria', 'Thailand', 'Malaysia', 'Turkey'];
        const placeholders = known.map(() => '?').join(', ');
        query += ` AND (country IS NULL OR country = '' OR country NOT IN (${placeholders}))`;
        replacements.push(...known);
      } else {
        query += ' AND country = ?';
        replacements.push(country);
      }
    }

    if (year && year !== 'All') {
      if (year === 'Other') {
        query += ' AND ("releaseYear" IS NULL OR "releaseYear" < 1980)';
      } else if (year.endsWith('s')) {
        const decade = parseInt(year.slice(0, -1));
        query += ' AND "releaseYear" >= ? AND "releaseYear" <= ?';
        replacements.push(decade, decade + 9);
      } else {
        query += ' AND "releaseYear" = ?';
        replacements.push(parseInt(year));
      }
    }

    query += ' ORDER BY "createdAt" DESC';

    const [movies] = await sequelize.query(query, { replacements });
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getReleasesByMonth = async (req, res) => {
  try {
    const year = parseInt(req.params.year) || 0;
    const month = parseInt(req.params.month) || 0;
    const { sequelize } = require('../config/db');
    const isPG = process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'));
    let query;
    if (isPG) {
      query = `SELECT * FROM movies WHERE EXTRACT(YEAR FROM "releaseDate") = ? AND EXTRACT(MONTH FROM "releaseDate") = ? ORDER BY "releaseDate" ASC`;
    } else {
      query = `SELECT * FROM movies WHERE strftime('%Y', "releaseDate") = ? AND strftime('%m', "releaseDate") = ? ORDER BY "releaseDate" ASC`;
    }
    const [movies] = await sequelize.query(query, { replacements: [String(year), String(month).padStart(2, '0')] });
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};