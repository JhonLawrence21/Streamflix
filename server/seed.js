const Category = require('./models/Category');
require('dotenv').config();

const sampleCategories = [
  { name: "Action", description: "High-octane action movies with thrilling sequences" },
  { name: "Comedy", description: "Hilarious comedies to brighten your day" },
  { name: "Drama", description: "Compelling dramas that touch the heart" },
  { name: "Horror", description: "Hair-raising horror movies" },
  { name: "Sci-Fi", description: "Mind-bending science fiction" },
  { name: "Thriller", description: "Edge-of-your-seat thrillers" },
  { name: "Romance", description: "Heartwarming love stories" }
];

const seedDatabase = async () => {
  try {
    const connectDB = require('./config/db');
    await connectDB();
    
    console.log('Clearing existing data...');
    await Category.destroy({ where: {}, truncate: true });
    
    console.log('Seeding categories...');
    await Category.bulkCreate(sampleCategories);
    
    console.log('Database seeded successfully! (Movies to be added by admin only)');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
