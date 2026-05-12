const { Op } = require('sequelize');
const Movie = require('../models/Movie');
const User = require('../models/User');

exports.getForYou = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const viewingHistory = user.viewingHistory || [];
    const watchlist = user.watchlist || [];
    
    let recommendedMovies = [];
    
    if (viewingHistory.length > 0) {
      const lastWatched = viewingHistory.slice(-5);
      const categoryWeights = {};
      
      lastWatched.forEach(item => {
        if (item.category) {
          categoryWeights[item.category] = (categoryWeights[item.category] || 0) + 1;
        }
      });

      const topCategory = Object.keys(categoryWeights).sort(
        (a, b) => categoryWeights[b] - categoryWeights[a]
      )[0];

      if (topCategory) {
        const similar = await Movie.findAll({
          where: {
            category: topCategory,
            id: { [Op.notIn]: viewingHistory.map(h => h.movieId) }
          },
          order: [['rating', 'DESC'], ['views', 'DESC']],
          limit: 10
        });
        recommendedMovies = [...similar];
      }

      const watchlistIds = watchlist.map(w => w.movieId || w);
      if (watchlistIds.length > 0) {
        const inWatchlistMovies = await Movie.findAll({
          where: { id: { [Op.in]: watchlistIds } }
        });

        inWatchlistMovies.forEach(movie => {
          if (movie.genre) {
            let genres = movie.genre;
            if (typeof genres === 'string') {
              try { genres = JSON.parse(genres); } catch { genres = [genres]; }
            }
            
            if (Array.isArray(genres)) {
              const genreName = genres[0];
              if (genreName && !recommendedMovies.find(m => m.id === movie.id)) {
                const genreMovies = Movie.findAll({
                  where: {
                    genre: { [Op.iLike]: `%${genreName}%` },
                    id: { [Op.notIn]: [...viewingHistory.map(h => h.movieId), ...watchlistIds] }
                  },
                  order: [['rating', 'DESC']],
                  limit: 3
                });
                recommendedMovies.push(...genreMovies);
              }
            }
          }
        });
      }
    }

    if (recommendedMovies.length < 5) {
      const popular = await Movie.findAll({
        where: {
          id: { [Op.notIn]: recommendedMovies.map(m => m.id) }
        },
        order: [['views', 'DESC'], ['rating', 'DESC']],
        limit: 10
      });
      recommendedMovies = [...recommendedMovies, ...popular];
    }

    const uniqueMovies = [];
    const seenIds = new Set();
    recommendedMovies.forEach(movie => {
      if (!seenIds.has(movie.id)) {
        seenIds.add(movie.id);
        uniqueMovies.push(movie);
      }
    });

    res.json(uniqueMovies.slice(0, 20));
  } catch (error) {
    console.error('Recommendation error:', error);
    const fallback = await Movie.findAll({
      order: [['views', 'DESC']],
      limit: 10
    });
    res.json(fallback.map(m => m.get({ plain: true })));
  }
};

exports.getSimilar = async (req, res) => {
  try {
    const { movieId } = req.params;
    const movie = await Movie.findByPk(movieId);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    let genreArray = movie.genre || [];
    if (typeof genreArray === 'string') {
      try { genreArray = JSON.parse(genreArray); } catch {}
    }

    const similar = await Movie.findAll({
      where: {
        id: { [Op.ne]: movie.id },
        [Op.or]: genreArray.map(g => ({
          genre: { [Op.iLike]: `%${g}%` }
        }))
      },
      order: [['rating', 'DESC']],
      limit: 10
    });

    res.json(similar.map(m => m.get({ plain: true })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.trackWatch = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { movieId } = req.params;
    const { duration, completed } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const viewingHistory = user.viewingHistory || [];
    const existingIndex = viewingHistory.findIndex(h => h.movieId === parseInt(movieId));

    const historyEntry = {
      movieId: movie.id,
      title: movie.title,
      category: movie.category,
      genre: movie.genre,
      thumbnail: movie.thumbnail,
      watchedAt: new Date().toISOString(),
      duration: duration || 0,
      completed: completed || false
    };

    if (existingIndex >= 0) {
      viewingHistory[existingIndex] = historyEntry;
    } else {
      viewingHistory.push(historyEntry);
    }

    const limitedHistory = viewingHistory.slice(-50);
    user.viewingHistory = limitedHistory;
    await user.save();

    res.json({ success: true, history: limitedHistory });
  } catch (error) {
    console.error('Track watch error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.viewingHistory || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.viewingHistory = [];
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};