const { Op } = require('sequelize');
const Movie = require('../models/Movie');
const Category = require('../models/Category');
const User = require('../models/User');
const db = require('../config/db');
const sequelize = db.sequelize;

exports.createMovie = async (req, res) => {
  try {
    const { genre, cast, ...otherData } = req.body;
    const movieData = {
      ...otherData,
      genre: Array.isArray(genre) ? genre : (genre || []),
      cast: Array.isArray(cast) ? cast : (cast || [])
    };
    const movie = await Movie.create(movieData);
    res.status(201).json(movie.get({ plain: true }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    const { genre, cast, ...otherData } = req.body;
    let updateData = { ...otherData };
    
    if (genre !== undefined) {
      updateData.genre = Array.isArray(genre) ? genre : genre;
    }
    if (cast !== undefined) {
      updateData.cast = Array.isArray(cast) ? cast : cast;
    }

    await movie.update(updateData);
    res.json(movie.get({ plain: true }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByPk(req.params.id);

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    await movie.destroy();
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.findAll({ order: [['createdAt', 'DESC']] });
    const plainMovies = movies.map(m => m.get({ plain: true }));
    res.json(plainMovies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, raw: true });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, profileImage } = req.body;
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();
    res.json(user.get({ plain: true }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalMovies = await Movie.count();
    const movies = await Movie.findAll();
    const totalViews = movies.reduce((sum, m) => sum + (m.views || 0), 0);

    const categoryCounts = await Movie.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('category')), 'count']
      ],
      group: ['category']
    });

    const recentMovies = await Movie.findAll({ 
      order: [['createdAt', 'DESC']], 
      limit: 5
    });

    res.json({
      totalUsers,
      totalMovies,
      totalViews,
      moviesByCategory: categoryCounts,
      recentMovies
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};