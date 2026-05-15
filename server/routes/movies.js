const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const {
  getMovies,
  getMovie,
  watchMovie,
  getFeaturedMovie,
  getFeaturedMovies,
  getTrendingMovies,
  getPopularMovies,
  getMoviesByCategory,
  getSimilarMovies,
  getUpcomingReleases,
  getReleasesByMonth,
  browseMovies
} = require('../controllers/movieController');

router.get('/test', async (req, res) => {
  try {
    const { sequelize } = require('../config/db');
    const [movies] = await sequelize.query('SELECT * FROM movies LIMIT 5');
    res.json({ count: movies.length, movies });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/featured/all', getFeaturedMovies);
router.get('/featured', getFeaturedMovie);
router.get('/trending', getTrendingMovies);
router.get('/popular', getPopularMovies);
router.get('/category/:category', getMoviesByCategory);
router.get('/similar/:id', getSimilarMovies);
router.get('/upcoming', getUpcomingReleases);
router.get('/releases/:year/:month', getReleasesByMonth);
router.get('/browse', browseMovies);
router.get('/categories', async (req, res) => {
  const { sequelize } = require('../config/db');

  try {
    // Never crash the site: always respond with an array
    res.setHeader('Content-Type', 'application/json');

    const ensureSeeded = async () => {
      // Ensure categories table exists (+ color)
      try {
        await sequelize.query(
          'CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL, description TEXT, "createdAt" TIMESTAMP DEFAULT NOW(), "updatedAt" TIMESTAMP DEFAULT NOW())'
        );
      } catch (e) {
        console.log('Create categories table:', e.message);
      }

      try {
        const tableInfo = await sequelize.getQueryInterface().describeTable('categories');
        if (tableInfo && !tableInfo.color) {
          await sequelize.query("ALTER TABLE categories ADD COLUMN color VARCHAR(255) DEFAULT '#E50914'");
        }
      } catch (e) {
        console.log('Categories column check:', e.message);
      }

    // If movies table is empty (or missing expected columns), insert a minimal safe dataset.
      // This prevents “categories still 0 movies” situations.
      let movieCount = 0;
      try {
        const [movieCountRows] = await sequelize.query('SELECT COUNT(*) as cnt FROM movies WHERE "deletedAt" IS NULL');
        movieCount = movieCountRows?.[0]?.cnt ?? 0;
      } catch (e) {
        console.log('movies count check failed:', e.message);
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
                '', '', '', '${m.thumbnail}',
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
            console.log('seed movie insert failed:', e.message);
          }

        }

      }

      // Ensure categories exist
      let categoryCount = 0;
      try {
        const [categoryCountRows] = await sequelize.query('SELECT COUNT(*) as cnt FROM categories');
        categoryCount = categoryCountRows?.[0]?.cnt ?? 0;
      } catch (e) {
        console.log('categories count check failed:', e.message);
      }

      if (categoryCount === 0) {
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

    await ensureSeeded();

    const [categories] = await sequelize.query('SELECT * FROM categories ORDER BY name ASC');
    return res.json(categories || []);
  } catch (error) {
    console.error('[GET /categories] error:', error);
    return res.json([]);
  }
});
router.get('/watch/:id', watchMovie);
router.get('/', getMovies);
router.get('/:id', getMovie);

module.exports = router;
