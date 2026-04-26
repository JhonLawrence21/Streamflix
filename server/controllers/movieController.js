const { Op } = require('sequelize');
const Movie = require('../models/Movie');
const { sequelize } = require('../config/db');

exports.getMovies = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;

    let where = {};
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;
    const movies = await Movie.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true
    });

    const total = await Movie.count({ where });

    res.json({
      movies,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    console.log('Looking for movie id:', movieId);
    
    const movie = await Movie.findByPk(movieId, { raw: true });
    console.log('Movie found:', movie ? movie.title : 'NOT FOUND');

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.watchMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, { raw: true });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await Movie.increment('views', { where: { id: movie.id } });

    const updatedMovie = await Movie.findByPk(movie.id, { raw: true });
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ where: { featured: true }, order: [['createdAt', 'DESC']], raw: true });

    if (!movie) {
      const randomMovie = await Movie.findOne({ order: [['views', 'DESC']], raw: true });
      return res.json(randomMovie);
    }

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrendingMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['views', 'DESC']], limit: 10, raw: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMoviesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const movies = await Movie.findAll({ where: { category }, order: [['createdAt', 'DESC']], raw: true });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSimilarMovies = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id, { raw: true });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    let genreArray = [];
    if (movie.genre) {
      if (Array.isArray(movie.genre)) {
        genreArray = movie.genre;
      } else if (typeof movie.genre === 'string') {
        try {
          const parsed = JSON.parse(movie.genre);
          genreArray = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          if (movie.genre.includes(',')) {
            genreArray = movie.genre.split(',').map(g => g.trim()).filter(g => g);
          } else {
            genreArray = [movie.genre.trim()];
          }
        }
      }
    }
    
    if (genreArray.length === 0) {
      return res.json([]);
    }

    const genreConditions = genreArray.map(g => ({
      genre: { [Op.like]: `%${g}%` }
    }));

    const similar = await Movie.findAll({
      where: {
        id: { [Op.ne]: movie.id },
        [Op.or]: genreConditions
      },
      limit: 6,
      raw: true
    });

    res.json(similar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
