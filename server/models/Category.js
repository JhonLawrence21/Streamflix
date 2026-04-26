const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Name is required' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  }
}, {
  tableName: 'categories',
  timestamps: true
});

module.exports = Category;