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
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Video URL is required' }
    }
  },
  externalUrl: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  thumbnail: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'uncategorized'
  },
  genre: {
    type: DataTypes.JSON,
    defaultValue: []
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
  cast: {
    type: DataTypes.JSON,
    defaultValue: []
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
  }
}, {
  tableName: 'movies',
  timestamps: true
});

module.exports = Movie;