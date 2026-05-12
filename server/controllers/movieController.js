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
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE category = '${category}' ORDER BY "createdAt" DESC`);
    
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

exports.getReleasesByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE EXTRACT(YEAR FROM "releaseDate") = ${year} AND EXTRACT(MONTH FROM "releaseDate") = ${month} ORDER BY "releaseDate" ASC`);
    
    res.json(processMovies(movies));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};