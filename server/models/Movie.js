const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Movie = sequelize.define('Movie', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  videoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: ''
  },
  externalUrl: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  trailerUrl: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  thumbnail: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  type: {
    type: DataTypes.ENUM('movie', 'tv'),
    defaultValue: 'movie'
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'uncategorized'
  },
  genre: {
    type: DataTypes.STRING,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('genre');
      if (!val) return [];
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('genre', JSON.stringify(val || []));
    }
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10
    }
  },
  duration: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  releaseYear: {
    type: DataTypes.INTEGER
  },
  releaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('released', 'upcoming', 'in-production'),
    defaultValue: 'released'
  },
  cast: {
    type: DataTypes.STRING,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('cast');
      if (!val) return [];
      try {
        return JSON.parse(val);
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('cast', JSON.stringify(val || []));
    }
  },
  director: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  trending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ageRating: {
    type: DataTypes.ENUM('G', 'PG', 'PG-13', 'R', 'NC-17', 'TV-Y', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'),
    defaultValue: 'PG-13'
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'movies',
  timestamps: true
});

module.exports = Movie;