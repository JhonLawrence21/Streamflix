const { Op } = require('sequelize');
const Movie = require('../models/Movie');
const Category = require('../models/Category');
const User = require('../models/User');
const db = require('../config/db');
const { sequelize: sharedSequelize } = db;

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
    const typeVal = otherData.type || 'movie';
    const countryVal = otherData.country || '';
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
    
    const { sequelize } = require('../config/db');
    const now = new Date().toISOString();
    
    await sequelize.query(`
      INSERT INTO movies (title, description, "videoUrl", "externalUrl", "trailerUrl", thumbnail, category, director, duration, genre, "cast", rating, "releaseYear", views, featured, "ageRating", status, "releaseDate", trending, type, country, "createdAt", "updatedAt")
      VALUES (${title ? `'${title.replace(/'/g, "''")}'` : null}, ${description ? `'${description.replace(/'/g, "''")}'` : null}, ${videoUrl ? `'${videoUrl.replace(/'/g, "''")}'` : null}, ${externalUrl ? `'${externalUrl.replace(/'/g, "''")}'` : null}, ${trailerUrl ? `'${trailerUrl.replace(/'/g, "''")}'` : null}, ${thumbnail ? `'${thumbnail.replace(/'/g, "''")}'` : null}, ${category ? `'${category}'` : null}, ${director ? `'${director.replace(/'/g, "''")}'` : null}, ${duration ? `'${duration}'` : null}, ${genreStr}, ${castStr}, ${rating}, ${releaseYear}, ${views}, ${featured}, ${ageRatingVal ? `'${ageRatingVal}'` : 'PG-13'}, ${statusVal ? `'${statusVal}'` : 'released'}, ${releaseDateVal !== 'NULL' ? `'${releaseDateVal}'` : 'NULL'}, ${trendingVal}, '${typeVal}', '${countryVal.replace(/'/g, "''")}', '${now}', '${now}')
    `);
    
    const [movies] = await sequelize.query('SELECT * FROM movies ORDER BY id DESC LIMIT 1');
    
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
    
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id = ${id} LIMIT 1`);
    
    if (movies.length === 0) {
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
    if (otherData.type !== undefined) updates.push(`type = '${otherData.type}'`);
    if (otherData.country !== undefined) updates.push(`country = '${(otherData.country || '').replace(/'/g, "''")}'`);
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
    
    
    res.json(updatedMovies[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMovie = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sequelize } = require('../config/db');
    
    const [movies] = await sequelize.query(`SELECT * FROM movies WHERE id = ${id} LIMIT 1`);
    if (movies.length === 0) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    
    await sequelize.query(`DELETE FROM movies WHERE id = ${id}`);
    
    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllMovies = async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query('SELECT * FROM movies ORDER BY "createdAt" DESC');
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
      await sequelize.query('CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, description TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())');
    } catch (e) { console.log('[createCategory] Create table:', e.message); }
    
    try {
      const tableInfo = await sequelize.getQueryInterface().describeTable('categories');
      if (tableInfo && !tableInfo.color) {
        await sequelize.query('ALTER TABLE categories ADD COLUMN color VARCHAR(255) DEFAULT \'#E50914\'');
      }
    } catch (e) { console.log('[createCategory] Column check:', e.message); }
    
    const now = new Date().toISOString();
    const colorValue = color || '#E50914';
    const descValue = description || '';
    
    await sequelize.query(`
      INSERT INTO categories (name, description, color, "createdAt", "updatedAt")
      VALUES ('${name.replace(/'/g, "''")}', '${descValue.replace(/'/g, "''")}', '${colorValue}', '${now}', '${now}')
    `);
    
    const [categories] = await sequelize.query('SELECT * FROM categories ORDER BY id DESC LIMIT 1');
    console.log('[createCategory] Created:', categories[0]);
    
    console.log('[createCategory] All categories in DB:');
    const [allCats] = await sequelize.query('SELECT * FROM categories ORDER BY id ASC');
    console.log(allCats);
    
    res.status(201).json(categories[0]);
  } catch (error) {
    console.error('[createCategory] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, color } = req.body;
    const { sequelize } = require('../config/db');

    const [categories] = await sequelize.query(`SELECT * FROM categories WHERE id = ${id} LIMIT 1`);
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const oldName = categories[0].name;
    const newName = name || oldName;
    const descValue = description !== undefined ? description : categories[0].description;
    const colorValue = color || categories[0].color;
    const now = new Date().toISOString();

    await sequelize.query(`
      UPDATE categories SET name = '${newName.replace(/'/g, "''")}', description = '${(descValue || '').replace(/'/g, "''")}', color = '${colorValue}', "updatedAt" = '${now}'
      WHERE id = ${id}
    `);

    if (oldName !== newName) {
      await sequelize.query(`UPDATE movies SET category = '${newName.replace(/'/g, "''")}' WHERE category = '${oldName.replace(/'/g, "''")}'`);
    }

    const [updated] = await sequelize.query('SELECT * FROM categories ORDER BY id DESC LIMIT 1');
    res.json(updated[0]);
  } catch (error) {
    console.error('[updateCategory] Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sequelize } = require('../config/db');

    const [categories] = await sequelize.query(`SELECT * FROM categories WHERE id = ${id} LIMIT 1`);
    if (categories.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const categoryName = categories[0].name;

    await sequelize.query(`UPDATE movies SET category = 'Uncategorized' WHERE category = '${categoryName.replace(/'/g, "''")}'`);
    await sequelize.query(`DELETE FROM categories WHERE id = ${id}`);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCategories = async (req, res) => {
  const { sequelize } = require('../config/db');

  try {
    // Always return safe data; never crash admin
    res.setHeader('Content-Type', 'application/json');

    const defaultCategories = [
      { name: 'Action', description: 'High-octane action movies', color: '#E50914' },
      { name: 'Comedy', description: 'Hilarious comedies', color: '#FFA500' },
      { name: 'Drama', description: 'Compelling dramas', color: '#4169E1' },
      { name: 'Horror', description: 'Hair-raising horror', color: '#8B0000' },
      { name: 'Sci-Fi', description: 'Mind-bending science fiction', color: '#00CED1' },
      { name: 'Thriller', description: 'Edge-of-your-seat thrillers', color: '#1C1C1C' },
      { name: 'Romance', description: 'Heartwarming love stories', color: '#FF69B4' },
      { name: 'TV Shows', description: 'Binge-worthy TV series', color: '#32CD32' }
    ];

    const ensureTablesAndSeed = async () => {
      // categories table
      try {
        await sequelize.query(
          'CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, description TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())'
        );
      } catch (e) {
        console.log('[admin getCategories] create categories:', e.message);
      }

      try {
        const tableInfo = await sequelize.getQueryInterface().describeTable('categories');
        if (tableInfo && !tableInfo.color) {
          await sequelize.query("ALTER TABLE categories ADD COLUMN color VARCHAR(255) DEFAULT '#E50914'");
        }
      } catch (e) {
        console.log('[admin getCategories] categories color check:', e.message);
      }

      // movies seed only if movies table empty
      let movieCount = 0;
      try {
        const [movieCountRows] = await sequelize.query('SELECT COUNT(*) as cnt FROM movies');
        movieCount = movieCountRows?.[0]?.cnt ?? 0;
      } catch (e) {
        console.log('[admin getCategories] movies count check failed:', e.message);
      }

      if (movieCount === 0) {
        const now = new Date().toISOString();
        const sampleMovies = [
          {
            title: 'Sample Action Hero',
            description: 'A great action movie',
            category: 'Action',
            genre: '["Action"]',
            rating: 8.0,
            views: 100,
            featured: 'true',
            trending: 'true',
            status: 'released',
            thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400'
          },
          {
            title: 'Sample Comedy Night',
            description: 'A great comedy movie',
            category: 'Comedy',
            genre: '["Comedy"]',
            rating: 7.5,
            views: 80,
            featured: 'false',
            trending: 'false',
            status: 'released',
            thumbnail: 'https://images.unsplash.com/photo-1536440132201-1d93eW3roh1g?w=400'
          },
          {
            title: 'Sample Drama',
            description: 'A great drama movie',
            category: 'Drama',
            genre: '["Drama"]',
            rating: 9.0,
            views: 60,
            featured: 'false',
            trending: 'false',
            status: 'released',
            thumbnail: 'https://images.unsplash.com/photo-1518676591709-ec05fabc79a2?w=400'
          },
          {
            title: 'Sample TV Show',
            description: 'A great TV show',
            category: 'TV Shows',
            genre: '["Mystery"]',
            rating: 8.6,
            views: 120,
            featured: 'false',
            trending: 'true',
            status: 'released',
            thumbnail: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400'
          }
        ];

        for (const m of sampleMovies) {
          try {
            await sequelize.query(`
              INSERT INTO movies (
                title, description, "videoUrl", "externalUrl", "trailerUrl", thumbnail, category,
                director, duration, genre, "cast", rating, "releaseYear", views,
                featured, "ageRating", status, "releaseDate", trending,
                "createdAt", "updatedAt"
              ) VALUES (
                '${m.title.replace(/'/g, "''")}',
                '${m.description.replace(/'/g, "''")}',
                '', '', '',
                ${m.thumbnail ? `'${m.thumbnail.replace(/'/g, "''")}'` : "''"},
                '${m.category.replace(/'/g, "''")}',
                '', '',
                ${m.genre ? `'${m.genre.replace(/'/g, "''")}'` : "'[]'"},
                '[]',
                ${Number.isFinite(m.rating) ? m.rating : 0},
                NULL,
                ${Number.isFinite(m.views) ? m.views : 0},
                ${m.featured === 'true' ? 'true' : 'false'},
                'PG-13',
                '${m.status || 'released'}',
                NULL,
                ${m.trending === 'true' ? 'true' : 'false'},
                '${now}',
                '${now}'
              )
            `);
          } catch (e) {
            console.log('[admin getCategories] seed movie insert failed:', e.message);
          }
        }
      }

      // categories seed if empty
      let categoryCount = 0;
      try {
        const [categoryCountRows] = await sequelize.query('SELECT COUNT(*) as cnt FROM categories');
        categoryCount = categoryCountRows?.[0]?.cnt ?? 0;
      } catch (e) {
        console.log('[admin getCategories] categories count check failed:', e.message);
      }

      if (categoryCount === 0) {
        const now = new Date().toISOString();
        for (const cat of defaultCategories) {
          try {
            await sequelize.query(`
              INSERT INTO categories (name, description, color, "createdAt", "updatedAt")
              VALUES ('${cat.name.replace(/'/g, "''")}', '${cat.description.replace(/'/g, "''")}', '${cat.color}', '${now}', '${now}')
            `);
          } catch (e) {
            // ignore duplicates
          }
        }
      }
    };

    await ensureTablesAndSeed();

    let categories = [];
    try {
      const [result] = await sequelize.query('SELECT * FROM categories ORDER BY name ASC');
      categories = result || [];
    } catch (e) {
      console.log('getCategories query:', e.message);
      return res.json([]);
    }

    const normalizeCategory = (value) => {
      return (value ?? '')
        .toString()
        .trim()
        .toLowerCase()
        // treat common separators as spaces
        .replace(/[\-_]/g, ' ')
        // collapse multiple spaces
        .replace(/\s+/g, ' ');
    };

    // Small synonyms/mappings to handle common category drift.
    // This is intentionally minimal; the normalization above handles most mismatches.
    const normalizeCategoryWithMap = (value) => {
      const n = normalizeCategory(value);
      const synonyms = {
        'tv show': 'tv shows',
        'tv series': 'tv shows',
        'scifi': 'sci fi',
        'sci fi': 'sci-fi',
        'sci-fi': 'sci-fi'
      };
      return synonyms[n] || n;
    };

    // Get the real category values stored in DB and their counts once.
    // Then map UI categories to these DB categories using normalization.
    let dbCategoryCounts = [];
    try {
      const [rows] = await sequelize.query(`
        SELECT category, COUNT(*)::int as cnt
        FROM movies
        WHERE category IS NOT NULL
        GROUP BY category
      `);
      dbCategoryCounts = rows || [];
    } catch (e) {
      // keep empty so we still return categories
      dbCategoryCounts = [];
    }

    const dbCountsByNormalized = new Map();
    for (const row of dbCategoryCounts) {
      const raw = row?.category;
      const cnt = row?.cnt ?? 0;
      const key = normalizeCategoryWithMap(raw);
      if (!key) continue;
      dbCountsByNormalized.set(key, (dbCountsByNormalized.get(key) || 0) + Number(cnt));
    }

    const categoriesWithCount = categories.map((cat) => {
      const catName = cat?.name ?? '';
      const key = normalizeCategoryWithMap(catName);
      const movieCount = dbCountsByNormalized.get(key) || 0;
      return { ...cat, movieCount };
    });

    return res.json(categoriesWithCount);
  } catch (error) {
    console.error('[admin getCategories] error:', error);
    return res.json([]);
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, raw: true });
    const usersWithCounts = users.map(u => ({
      ...u,
      watchlistCount: Array.isArray(u.watchlist) ? u.watchlist.length : 0,
      historyCount: Array.isArray(u.viewingHistory) ? u.viewingHistory.length : 0
    }));
    res.json(usersWithCounts);
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
    
    let userCount = 0, movieCount = 0, totalViews = 0, avgRating = 0;
    let releasedCount = 0, upcomingCount = 0, inProductionCount = 0;
    let categoryCounts = [], recentMovies = [], topMovies = [], trending = [];
    
    try {
      const [userResult] = await sequelize.query('SELECT COUNT(*) as cnt FROM users');
      userCount = userResult[0]?.cnt || 0;
    } catch (e) { console.log('users query error:', e.message); }
    
    try {
      const [movieResult] = await sequelize.query('SELECT COUNT(*) as cnt FROM movies');
      movieCount = movieResult[0]?.cnt || 0;
    } catch (e) { console.log('movies query error:', e.message); }
    
    try {
      const [viewsResult] = await sequelize.query('SELECT COALESCE(SUM(views), 0) as total FROM movies');
      totalViews = viewsResult[0]?.total || 0;
    } catch (e) { console.log('views query error:', e.message); }
    
    try {
      const [ratingResult] = await sequelize.query('SELECT COALESCE(AVG(rating), 0) as avg FROM movies WHERE rating IS NOT NULL');
      avgRating = ratingResult[0]?.avg || 0;
    } catch (e) { console.log('rating query error:', e.message); }
    
    try {
      const [catResult] = await sequelize.query(`SELECT category, COUNT(*) as count FROM movies WHERE category IS NOT NULL GROUP BY category`);
      categoryCounts = catResult || [];
    } catch (e) { console.log('category query error:', e.message); }
    
    try {
      const [relResult] = await sequelize.query(`SELECT COUNT(*) as cnt FROM movies WHERE status = 'released'`);
      releasedCount = relResult[0]?.cnt || 0;
    } catch (e) { console.log('released query error:', e.message); }
    
    try {
      const [upcResult] = await sequelize.query(`SELECT COUNT(*) as cnt FROM movies WHERE status = 'upcoming'`);
      upcomingCount = upcResult[0]?.cnt || 0;
    } catch (e) { console.log('upcoming query error:', e.message); }
    
    try {
      const [prodResult] = await sequelize.query(`SELECT COUNT(*) as cnt FROM movies WHERE status = 'in-production'`);
      inProductionCount = prodResult[0]?.cnt || 0;
    } catch (e) { console.log('in-production query error:', e.message); }
    
    try {
      const [recentResult] = await sequelize.query('SELECT * FROM movies ORDER BY "createdAt" DESC LIMIT 5');
      recentMovies = recentResult || [];
    } catch (e) { console.log('recent query error:', e.message); }
    
    try {
      const [topResult] = await sequelize.query('SELECT * FROM movies ORDER BY views DESC LIMIT 10');
      topMovies = topResult || [];
    } catch (e) { console.log('top query error:', e.message); }
    
    try {
      const [trendingResult] = await sequelize.query('SELECT * FROM movies WHERE trending = true ORDER BY views DESC LIMIT 5');
      trending = trendingResult || [];
    } catch (e) { console.log('trending query error:', e.message); }
    
    res.json({
      totalUsers: userCount,
      totalMovies: movieCount,
      totalViews: totalViews,
      avgRating: avgRating,
      releasedCount: releasedCount,
      upcomingCount: upcomingCount,
      inProductionCount: inProductionCount,
      moviesByCategory: categoryCounts,
      recentMovies: recentMovies,
      topMovies: topMovies,
      trending: trending
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};