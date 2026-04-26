require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ where: { email: 'admin@streamflix.com' } });
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    await User.create({
      name: 'Admin',
      email: 'admin@streamflix.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created: admin@streamflix.com / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();