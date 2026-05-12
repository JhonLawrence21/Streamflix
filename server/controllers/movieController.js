const { Op } = require('sequelize');
const Movie = require('../models/Movie');

exports.getMovies = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { Sequelize } = require('sequelize');
    const sequelize = new Sequelize(process.env.DATABASE_URL, { logging: false });
    
    const [movies] = await sequelize.query(`SELECT * FROM movies ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`);
    const [[{ count }]] = await sequelize.query('SELECT COUNT(*) as count FROM movies');
    
    await sequelize.close();

    res.json({
      movies: movies,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('getMovies error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMovie = async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    console.log('Looking for movie id:', movieId);
    
    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const plainMovie = movie.get({ plain: true });
    console.log('Movie found:', plainMovie ? plainMovie.title : 'NOT FOUND');
    res.json(plainMovie);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ message: error.message });
  }
};

const viewedCache = new Map();

const clearOldEntries = () => {
  const now = Date.now();
  for (const [key, timestamp] of viewedCache.entries()) {
    if (now - timestamp > 24 * 60 * 60 * 1000) {
      viewedCache.delete(key);
    }
  }
};
setInterval(clearOldEntries, 60 * 60 * 1000);

exports.watchMovie = async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movie = await Movie.findByPk(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const viewedKey = `${movieId}_${clientIp}`;

    if (!viewedCache.has(viewedKey)) {
      await Movie.increment('views', { where: { id: movie.id } });
      viewedCache.set(viewedKey, Date.now());
    }

    const updatedMovie = await Movie.findByPk(movie.id);
    res.json(updatedMovie.get({ plain: true }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFeaturedMovie = async (req, res) => {
  try {
    const movie = await Movie.findOne({ where: { featured: true }, order: [['createdAt', 'DESC']] });
    if (!movie) {
      const randomMovie = await Movie.findOne({ order: [['views', 'DESC']] });
      return res.json(randomMovie ? randomMovie.get({ plain: true }) : null);
    }
    res.json(movie.get({ plain: true }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrendingMovies = async (req, res) => {
  try {
    // First try to get manually-tagged trending movies
    let movies = await Movie.findAll({
      where: { trending: true },
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Fallback to most-viewed if no movies are tagged as trending
    if (movies.length === 0) {
      movies = await Movie.findAll({ order: [['views', 'DESC']], limit: 10 });
    }

    res.json(movies.map(m => m.get({ plain: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPopularMovies = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const movies = await Movie.findAll({
      order: [['views', 'DESC'], ['rating', 'DESC']],
      limit: parseInt(limit)
    });
    res.json(movies.map(m => m.get({ plain: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMoviesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const movies = await Movie.findAll({ where: { category }, order: [['createdAt', 'DESC']] });
    res.json(movies.map(m => m.get({ plain: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSimilarMovies = async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    const movie = await Movie.findByPk(movieId);

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
      genre: { [Op.iLike]: `%${g}%` }
    }));

    const similar = await Movie.findAll({
      where: {
        id: { [Op.ne]: movie.id },
        [Op.or]: genreConditions
      },
      limit: 6
    });

    res.json(similar.map(m => m.get({ plain: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUpcomingReleases = async (req, res) => {
  try {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    
    let movies = await Movie.findAll({
      where: {
        [Op.or]: [
          { status: 'upcoming' },
          {
            status: 'released',
            releaseDate: { [Op.gte]: now }
          }
        ]
      },
      order: [['releaseDate', 'ASC'], ['createdAt', 'DESC']]
    });

    if (movies.length === 0) {
      movies = await Movie.findAll({
        where: {
          [Op.or]: [
            { releaseYear: { [Op.gte]: now.getFullYear() } },
            { releaseDate: { [Op.gte]: now } }
          ]
        },
        order: [['releaseYear', 'ASC'], ['createdAt', 'DESC']],
        limit: 20
      });
    }

    res.json(movies.map(m => m.get({ plain: true })));
  } catch (error) {
    console.error('Error fetching upcoming:', error);
    const allMovies = await Movie.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    res.json(allMovies.map(m => m.get({ plain: true })));
  }
};

exports.getReleasesByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    let movies = await Movie.findAll({
      where: {
        releaseDate: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['releaseDate', 'ASC']]
    });

    if (movies.length === 0) {
      movies = await Movie.findAll({
        where: {
          releaseYear: parseInt(year)
        },
        order: [['releaseDate', 'ASC']]
      });
    }

    res.json(movies.map(m => m.get({ plain: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
