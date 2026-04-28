const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  const isPostgres = process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://');
  
  if (isPostgres) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
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
    sequelize = new Sequelize(process.env.DATABASE_URL, {
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

const connectDB = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const dbType = process.env.DATABASE_URL ? 'postgresql' : (process.env.MYSQL_HOST ? 'mysql' : (process.env.PGHOST ? 'postgres' : 'sqlite'));
      console.log(`[DB] Attempt ${attempt}/${retries}: Connecting to ${dbType}...`);
      if (process.env.DATABASE_URL) {
        console.log(`[DB] DATABASE_URL is set`);
      } else {
        console.log(`[DB] DATABASE_URL is NOT set — using ${dbType}`);
      }
      await sequelize.authenticate();
      console.log('[DB] Database Connected successfully');
      await sequelize.sync({ force: false });
      console.log('[DB] Database synced (force: false)');
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
