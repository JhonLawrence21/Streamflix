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
          // Migrate users table profileImage to TEXT
          try {
            const userTableInfo = await queryInterface.describeTable('users');
            console.log('[DB] Users table columns:', Object.keys(userTableInfo));
            if (userTableInfo) {
              const colNames = Object.keys(userTableInfo);
              for (const colName of colNames) {
                if (colName.toLowerCase().includes('profile') || colName.toLowerCase().includes('image')) {
                  console.log('[DB] Found column:', colName, 'type:', userTableInfo[colName].type);
                  const colType = userTableInfo[colName].type;
                  if (colType && (colType.includes('varchar') || colType.includes('character varying'))) {
                    console.log('[DB] Migrating: changing', colName, 'to TEXT...');
                    await sequelize.query(`ALTER TABLE users ALTER COLUMN "${colName}" TYPE TEXT`);
                    console.log('[DB] Migration complete:', colName, 'changed to TEXT');
                  }
                }
              }
            }
          } catch (e) {
            console.log('[DB] Users table migration info:', e.message);
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
