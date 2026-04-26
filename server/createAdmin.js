const User = require('./models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const connectDB = require('./config/db');
    await connectDB();
    
    const adminExists = await User.findOne({ where: { email: 'admin@streamflix.com' } });
    if (adminExists) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@streamflix.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin created successfully!');
    console.log('Email: admin@streamflix.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();