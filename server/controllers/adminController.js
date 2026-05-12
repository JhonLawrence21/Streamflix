const { Op } = require('sequelize');
const Movie = require('../models/Movie');
const Category = require('../models/Category');
const User = require('../models/User');
const db = require('../config/db');
const sequelize = db.sequelize;

const getSequelize = () => {
  const { Sequelize } = require('sequelize');
  return new Sequelize(process.env.DATABASE_URL, { logging: false });
};

exports.createMovie = async (req, res) => {
  try {
    console.log('[createMovie] Received body:', JSON.stringify(req.body));
    const { genre, cast, ageRating, status, releaseDate, trending, ...otherData } = req.body;
    
    const genreStr = Array.isArray(genre) ? JSON.stringify(genre) : (typeof genre === 'string' ? genre : '[]');
    const castStr = Array.isArray(cast) ? JSON.stringify(cast) : (typeof cast === 'string' ? cast : '[]');
    
    const title = otherData.title || '';
    const description = otherData.description || '';
    const videoUrl = otherData.videoUrl || '';
    const externalUrl = otherData.externalUrl || '';
    const trailerUrl = otherData.trailerUrl || '';
    const thumbnail = otherData.thumbnail || '';
    const category = otherData.category || 'Movies';
    const director = otherData.director || '';
    const duration = otherData.duration || '';
    const rating = parseFloat(otherData.rating) || 0;
    const releaseYear = parseInt(otherData.releaseYear) || null;
    const views = parseInt(otherData.views) || 0;
    const featured = otherData.featured ? 'true' : 'false';
    const ageRatingVal = ageRating || 'PG-13';
    const statusVal = status || 'released';
    const releaseDateVal = releaseDate || 'NULL';
    const trendingVal = trending ? 'true' : 'false';
    
    const sequelize = getSequelize();
    const now = new Date().toISOString();
    
    await sequelize.query(`
      INSERT INTO movies (title, description, "videoUrl", "externalUrl", "trailerUrl", thumbnail, category, director, duration, genre, "cast", rating, "releaseYear", views, featured, "ageRating", status, "releaseDate", trending, "createdAt", "updatedAt")
      VALUES (${title ? `'${title.replace(/'/g, "''")}'` : null}, ${description ? `'${description.replace(/'/g, "''")}'` : null}, ${videoUrl ? `'${videoUrl.replace(/'/g, "''")}'` : null}, ${externalUrl ? `'${externalUrl.replace(/'/g, "''")}'` : null}, ${trailerUrl ? `'${trailerUrl.replace(/'/g, "''")}'` : null}, ${thumbnail ? `'${thumbnail.replace(/'/g, "''")}'` : null}, ${category ? `'${category}'` : null}, ${director ? `'${director.replace(/'/g, "''")}'` : null}, ${duration ? `'${duration}'` : null}, ${genreStr}, ${castStr}, ${rating}, ${releaseYear}, ${views}, ${featured}, ${ageRatingVal ? `'${ageRatingVal}'` : 'PG-13'}, ${statusVal ? `'${statusVal}'` : 'released'}, ${releaseDateVal !== 'NULL' ? `'${releaseDateVal}'` : 'NULL'}, ${trendingVal}, '${now}', '${now}')
    `);
    
    const [movies] = await sequelize.query('SELECT * FROM movies ORDER BY id DESC LIMIT 1');
    await sequelize.close();
    
    console.log('[createMovie] Saved movie:', JSON.stringify(movies[0]));
    res.status(201).json(movies[0]);
  } catch (error) {
    console.error('[createMovie] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateMovie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { genre, cast, ageRating, status, releaseDate, trending, ...otherData } = req.body;
    
    const sequelize = getSequelize();
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id = ${id} LIMIT 1`);
    
    if (movies.length === 0) {
      await sequelize.close();
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    const genreStr = Array.isArray(genre) ? JSON.stringify(genre) : (typeof genre === 'string' ? genre : null);
    const castStr = Array.isArray(cast) ? JSON.stringify(cast) : (typeof cast === 'string' ? cast : null);
    
    const updates = [];
    if (otherData.title !== undefined) updates.push(`title = '${otherData.title.replace(/'/g, "''")}'`);
    if (otherData.description !== undefined) updates.push(`description = '${(otherData.description || '').replace(/'/g, "''")}'`);
    if (otherData.videoUrl !== undefined) updates.push(`"videoUrl" = '${(otherData.videoUrl || '').replace(/'/g, "''")}'`);
    if (otherData.externalUrl !== undefined) updates.push(`"externalUrl" = '${(otherData.externalUrl || '').replace(/'/g, "''")}'`);
    if (otherData.trailerUrl !== undefined) updates.push(`"trailerUrl" = '${(otherData.trailerUrl || '').replace(/'/g, "''")}'`);
    if (otherData.thumbnail !== undefined) updates.push(`thumbnail = '${(otherData.thumbnail || '').replace(/'/g, "''")}'`);
    if (otherData.category !== undefined) updates.push(`category = '${otherData.category}'`);
    if (otherData.director !== undefined) updates.push(`director = '${(otherData.director || '').replace(/'/g, "''")}'`);
    if (otherData.duration !== undefined) updates.push(`duration = '${otherData.duration || ''}'`);
    if (otherData.rating !== undefined) updates.push(`rating = ${parseFloat(otherData.rating) || 0}`);
    if (otherData.releaseYear !== undefined) updates.push(`"releaseYear" = ${parseInt(otherData.releaseYear) || null}`);
    if (otherData.views !== undefined) updates.push(`views = ${parseInt(otherData.views) || 0}`);
    if (otherData.featured !== undefined) updates.push(`featured = ${otherData.featured ? 'true' : 'false'}`);
    if (genreStr) updates.push(`genre = '${genreStr.replace(/'/g, "''")}'`);
    if (castStr) updates.push(`"cast" = '${castStr.replace(/'/g, "''")}'`);
    if (ageRating) updates.push(`"ageRating" = '${ageRating}'`);
    if (status) updates.push(`status = '${status}'`);
    if (releaseDate) updates.push(`"releaseDate" = '${releaseDate}'`);
    if (trending !== undefined) updates.push(`trending = ${trending ? 'true' : 'false'}`);
    
    updates.push(`"updatedAt" = '${new Date().toISOString()}'`);
    
    await sequelize.query(`UPDATE movies SET ${updates.join(', ')} WHERE id = ${id}`);
    
    const [updatedMovies] = await sequelize.query(`SELECT * FROM movies WHERE id = ${id} LIMIT 1`);
    await sequelize.close();
    
    res.json(updatedMovies[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sequelize = getSequelize();
    
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id = ${id} LIMIT 1`);
    if (movies.length === 0) {
      await sequelize.close();
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    await sequelize.query(`DELETE FROM movies WHERE id = ${id}`);
    await sequelize.close();
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const sequelize = getSequelize();
    const [movies] = await sequelize.query('SELECT * FROM movies ORDER BY "createdAt" DESC');
    await sequelize.close();
    console.log('[getAllMovies] Found', movies.length, 'movies');
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    console.log('[createCategory] Received:', { name, description, color });
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const { sequelize } = require('../config/db');
    
    try {
      const tableInfo = await sequelize.getQueryInterface().describeTable('categories');
      console.log('[createCategory] Table columns:', Object.keys(tableInfo));
      
      if (!tableInfo.color) {
        await sequelize.query('ALTER TABLE categories ADD COLUMN color VARCHAR(255) DEFAULT \'#E50914\'');
        console.log('[createCategory] Added color column');
      }
    } catch (e) {
      console.log('[createCategory] Table check error:', e.message);
    }
    
    const now = new Date().toISOString();
    const colorValue = color || '#E50914';
    
    await sequelize.query(`
      INSERT INTO categories (name, description, color, "createdAt", "updatedAt")
      VALUES ('${name.replace(/'/g, "''")}', '${(description || '').replace(/'/g, "''")}', '${colorValue}', '${now}', '${now}')
    `);
    
    console.log('[createCategory] Insert successful');
    const [categories] = await sequelize.query('SELECT * FROM categories ORDER BY id DESC LIMIT 1');
    console.log('[createCategory] Created:', categories[0]);
    
    res.status(201).json(categories[0]);
  } catch (error) {
    console.error('[createCategory] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sequelize } = require('../config/db');
    
    const [categories] = await sequelize.query(`SELECT * FROM categories WHERE id = ${id} LIMIT 1`);
    if (categories.length === 0) {
      await sequelize.close();
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await sequelize.query(`DELETE FROM categories WHERE id = ${id}`);
    await sequelize.close();
    
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    const [categories] = await sequelize.query('SELECT * FROM categories ORDER BY name ASC');
    
    const categoriesWithCount = categories.map(cat => {
      const [[{ categoryCount }]] = sequelize.query(`SELECT COUNT(*) as count FROM movies WHERE category = '${cat.name}'`);
      return { ...cat, movieCount: categoryCount?.count || 0 };
    });
    
    res.json(categoriesWithCount);
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
    const { sequelize } = require('../config/db');
    
    const [[{ userCount }]] = await sequelize.query('SELECT COUNT(*) as userCount FROM users');
    const [[{ movieCount }]] = await sequelize.query('SELECT COUNT(*) as movieCount FROM movies');
    const [[{ totalViews }]] = await sequelize.query('SELECT COALESCE(SUM(views), 0) as totalViews FROM movies');
    const [[{ avgRating }]] = await sequelize.query('SELECT COALESCE(AVG(rating), 0) as avgRating FROM movies WHERE rating IS NOT NULL');
    
    const [categoryCounts] = await sequelize.query(`
      SELECT category, COUNT(*) as count 
      FROM movies 
      WHERE category IS NOT NULL 
      GROUP BY category
    `);
    
    const [[{ releasedCount }]] = await sequelize.query(`SELECT COUNT(*) as releasedCount FROM movies WHERE status = 'released'`);
    const [[{ upcomingCount }]] = await sequelize.query(`SELECT COUNT(*) as upcomingCount FROM movies WHERE status = 'upcoming'`);
    const [[{ inProductionCount }]] = await sequelize.query(`SELECT COUNT(*) as inProductionCount FROM movies WHERE status = 'in-production'`);
    
    const [recentMovies] = await sequelize.query('SELECT * FROM movies ORDER BY "createdAt" DESC LIMIT 5');
    const [topMovies] = await sequelize.query('SELECT * FROM movies ORDER BY views DESC LIMIT 10');
    const [trending] = await sequelize.query('SELECT * FROM movies WHERE trending = true ORDER BY views DESC LIMIT 5');
    
    res.json({
      totalUsers: userCount || 0,
      totalMovies: movieCount || 0,
      totalViews: totalViews || 0,
      avgRating: avgRating || 0,
      releasedCount: releasedCount || 0,
      upcomingCount: upcomingCount || 0,
      inProductionCount: inProductionCount || 0,
      moviesByCategory: categoryCounts || [],
      recentMovies: recentMovies || [],
      topMovies: topMovies || [],
      trending: trending || []
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};