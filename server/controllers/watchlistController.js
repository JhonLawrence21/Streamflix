const User = require('../models/User');
const Movie = require('../models/Movie');

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

    const movies = await Movie.findAll({
      where: { id: watchlistIds },
      raw: true
    });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findByPk(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const user = await User.findByPk(req.user.id);
    const watchlist = [...(user.watchlist || [])];
    const movieIdInt = parseInt(movieId);

    if (watchlist.includes(movieIdInt)) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    watchlist.push(movieIdInt);
    user.watchlist = watchlist;
    await user.save();

    res.json({ message: 'Movie added to watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  try {
    const { movieId } = req.params;

    const user = await User.findByPk(req.user.id);
    const watchlist = user.watchlist || [];
    const movieIdInt = parseInt(movieId);

    user.watchlist = watchlist.filter(id => id !== movieIdInt);
    await user.save();

    res.json({ message: 'Movie removed from watchlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};