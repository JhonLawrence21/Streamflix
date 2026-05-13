const { Sequelize } = require('sequelize');

let sequelize;

console.log('[DB] Checking DATABASE_URL...');
console.log('[DB] DATABASE_URL present:', !!process.env.DATABASE_URL);
if (process.env.DATABASE_URL) {
  const dbUrl = process.env.DATABASE_URL;
  console.log('[DB] DATABASE_URL:', dbUrl.substring(0, 30) + '...');
  
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  
  if (isPostgres) {
    console.log('[DB] Using PostgreSQL dialect');
    sequelize = new Sequelize(dbUrl, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });
  } else {
    console.log('[DB] Using generic sequelize for:', dbUrl.split('://')[0]);
    sequelize = new Sequelize(dbUrl, {
      logging: false
    });
  }
} else if (process.env.MYSQL_HOST) {
  sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'railway',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
} else if (process.env.PGHOST) {
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.PGHOST,
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  });
}

const connectDB = async (retries = 5, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const dbType = process.env.DATABASE_URL ? 'postgresql' : (process.env.MYSQL_HOST ? 'mysql' : (process.env.PGHOST ? 'postgres' : 'sqlite'));
      console.log(`[DB] Attempt ${attempt}/${retries}: Connecting to ${dbType}...`);
      if (process.env.DATABASE_URL) {
        console.log(`[DB] DATABASE_URL is set (length: ${process.env.DATABASE_URL.length})`);
      } else {
        console.log(`[DB] DATABASE_URL is NOT set — using ${dbType}`);
      }
      await sequelize.authenticate();
      console.log('[DB] ✓ Database Connected successfully');
      await sequelize.sync({ force: false });
      console.log('[DB] ✓ Database synced (force: false)');

      // Auto-migrate: add trending column if missing
      try {
        const queryInterface = sequelize.getQueryInterface();
        let tableInfo = {};
        try {
          tableInfo = await queryInterface.describeTable('movies');
        } catch (e) {
          console.log('[DB] Movies table might not exist yet, will be created by sync');
        }

        if (tableInfo && Object.keys(tableInfo).length > 0) {
          // Migrate users table profileImage to TEXT and add reset columns
          try {
            const userTableInfo = await queryInterface.describeTable('users');
            console.log('[DB] Users table columns:', Object.keys(userTableInfo));
            
            if (userTableInfo && userTableInfo.profileImage) {
              const colType = userTableInfo.profileImage.type;
              console.log('[DB] Found column: profileImage type:', colType);
              
              console.log('[DB] Attempting to change profileImage to TEXT...');
              try {
                await sequelize.query('ALTER TABLE users ALTER COLUMN "profileImage" SET DATA TYPE TEXT');
                console.log('[DB] Migration complete: profileImage changed to TEXT');
              } catch (alterErr) {
                console.log('[DB] Error:', alterErr.message);
                console.log('[DB] Trying alternate method...');
                await sequelize.query('ALTER TABLE users ALTER COLUMN "profileImage" TYPE TEXT');
                console.log('[DB] Migration complete (alt): profileImage changed to TEXT');
              }
            }
            
            // Add resetToken column if missing
            if (!userTableInfo.resetToken) {
              console.log('[DB] Migrating: adding resetToken column to users...');
              await queryInterface.addColumn('users', 'resetToken', {
                type: Sequelize.STRING,
                allowNull: true
              });
              console.log('[DB] Migration complete: resetToken column added');
            } else {
              console.log('[DB] Migration check: resetToken column already exists');
            }
            
            // Add resetTokenExpiry column if missing
            if (!userTableInfo.resetTokenExpiry) {
              console.log('[DB] Migrating: adding resetTokenExpiry column to users...');
              await queryInterface.addColumn('users', 'resetTokenExpiry', {
                type: Sequelize.DATE,
                allowNull: true
              });
              console.log('[DB] Migration complete: resetTokenExpiry column added');
            } else {
              console.log('[DB] Migration check: resetTokenExpiry column already exists');
            }
          } catch (e) {
            console.log('[DB] Users table migration error:', e.message);
          }

          if (!tableInfo.trending) {
            console.log('[DB] Migrating: adding trending column to movies...');
            await queryInterface.addColumn('movies', 'trending', {
              type: Sequelize.BOOLEAN,
              defaultValue: false,
              allowNull: false
            });
            console.log('[DB] Migration complete: trending column added');
          } else {
            console.log('[DB] Migration check: trending column already exists');
          }

          // Auto-migrate: add releaseDate column if missing
          if (!tableInfo.releaseDate) {
            console.log('[DB] Migrating: adding releaseDate column to movies...');
            await queryInterface.addColumn('movies', 'releaseDate', {
              type: Sequelize.DATE,
              allowNull: true
            });
            console.log('[DB] Migration complete: releaseDate column added');
          } else {
            console.log('[DB] Migration check: releaseDate column already exists');
          }

          // Auto-migrate: add status column if missing
          if (!tableInfo.status) {
            console.log('[DB] Migrating: adding status column to movies...');
            await queryInterface.addColumn('movies', 'status', {
              type: Sequelize.ENUM('released', 'upcoming', 'in-production'),
              defaultValue: 'released'
            });
            console.log('[DB] Migration complete: status column added');
          } else {
            console.log('[DB] Migration check: status column already exists');
          }

          // Auto-migrate: add type column if missing
          if (!tableInfo.type) {
            console.log('[DB] Migrating: adding type column to movies...');
            await queryInterface.addColumn('movies', 'type', {
              type: Sequelize.STRING,
              defaultValue: 'movie'
            });
            console.log('[DB] Migration complete: type column added');
          } else {
            console.log('[DB] Migration check: type column already exists');
          }

          // Auto-migrate: add country column if missing
          if (!tableInfo.country) {
            console.log('[DB] Migrating: adding country column to movies...');
            await queryInterface.addColumn('movies', 'country', {
              type: Sequelize.STRING,
              defaultValue: ''
            });
            console.log('[DB] Migration complete: country column added');
          } else {
            console.log('[DB] Migration check: country column already exists');
          }

          // Set type='tv' for existing movies in TV Shows categories
          try {
            const [tvMovies] = await sequelize.query(`SELECT COUNT(*) as cnt FROM movies WHERE LOWER(category) IN ('tv shows', 'tv show', 'tv series') AND (type IS NULL OR type = '' OR type = 'movie')`);
            if (tvMovies?.[0]?.cnt > 0) {
              console.log(`[DB] Migrating: setting type='tv' for ${tvMovies[0].cnt} movies in TV categories...`);
              await sequelize.query(`UPDATE movies SET type = 'tv' WHERE LOWER(category) IN ('tv shows', 'tv show', 'tv series') AND (type IS NULL OR type = '' OR type = 'movie')`);
              console.log('[DB] Migration complete: TV Shows type updated');
            } else {
              console.log('[DB] Migration check: no TV Shows need type update');
            }
          } catch (e) {
            console.log('[DB] TV type migration error (non-fatal):', e.message);
          }
        }
      } catch (migrateErr) {
        console.error('[DB] Migration warning (non-fatal):', migrateErr.message);
      }

      return sequelize;
    } catch (error) {
      console.error(`[DB] Attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        console.error('[DB] All retries exhausted. Server will exit.');
        throw error;
      }
      console.log(`[DB] Retrying in 3 seconds...`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
