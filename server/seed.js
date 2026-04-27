const Category = require('./models/Category');
const Movie = require('./models/Movie');
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

const sampleMovies = [
  {
    title: "The Action Hero",
    description: "An epic adventure of a hero who must save the world from destruction.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400",
    category: "Action",
    genre: ["Action", "Adventure"],
    rating: 8.5,
    duration: "2h 15m",
    releaseYear: 2024,
    director: "John Director",
    featured: true
  },
  {
    title: "Comedy Night",
    description: "A hilarious comedy that will keep you laughing all night.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1536440132201-1d93eW3roh1g?w=400",
    category: "Comedy",
    genre: ["Comedy"],
    rating: 7.8,
    duration: "1h 45m",
    releaseYear: 2024,
    director: "Jane Director",
    featured: false
  },
  {
    title: "Dark Drama",
    description: "A compelling drama that explores the depths of human emotion.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1518676591709-ec05fabc79a2?w=400",
    category: "Drama",
    genre: ["Drama"],
    rating: 9.0,
    duration: "2h 30m",
    releaseYear: 2023,
    director: "Bob Director",
    featured: false
  }
];

const seedDatabase = async () => {
  try {
    const connectDB = require('./config/db');
    await connectDB();

    // Only seed if database is empty — preserves existing movies permanently
    const existingMovies = await Movie.count();
    const existingCategories = await Category.count();

    if (existingMovies > 0 || existingCategories > 0) {
      console.log('Database already has data. Skipping seed to preserve existing movies.');
      console.log(`Movies: ${existingMovies}, Categories: ${existingCategories}`);
      process.exit(0);
    }

    console.log('Seeding categories...');
    await Category.bulkCreate(sampleCategories);

    console.log('Seeding movies...');
    await Movie.bulkCreate(sampleMovies);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
