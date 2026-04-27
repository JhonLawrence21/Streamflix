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

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database Connected...');
    await sequelize.sync({ force: false, alter: true });
    console.log('Database synced');
    return sequelize;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return sequelize;
  }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
module.exports.Sequelize = Sequelize;
