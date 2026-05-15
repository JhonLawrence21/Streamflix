const Category = require('./models/Category');
const Movie = require('./models/Movie');
require('dotenv').config();

const sampleCategories = [
  { name: "Action", description: "High-octane action movies with thrilling sequences", color: "#E50914" },
  { name: "Comedy", description: "Hilarious comedies to brighten your day", color: "#FFA500" },
  { name: "Drama", description: "Compelling dramas that touch the heart", color: "#4169E1" },
  { name: "Horror", description: "Hair-raising horror movies", color: "#8B0000" },
  { name: "Sci-Fi", description: "Mind-bending science fiction", color: "#00CED1" },
  { name: "Thriller", description: "Edge-of-your-seat thrillers", color: "#1C1C1C" },
  { name: "Romance", description: "Heartwarming love stories", color: "#FF69B4" },
  { name: "TV Shows", description: "Binge-worthy TV series and shows", color: "#32CD32" }
];

const sampleMovies = [
  {
    title: "The Action Hero",
    description: "An epic adventure of a hero who must save the world from destruction.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400",
    category: "Action",
    genre: ["Action", "Adventure"],
    rating: 8.5,
    duration: "2h 15m",
    releaseYear: 2024,
    director: "John Director",
    featured: true,
    trending: true
  },
  {
    title: "Comedy Night",
    description: "A hilarious comedy that will keep you laughing all night.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1536440132201-1d93eW3roh1g?w=400",
    category: "Comedy",
    genre: ["Comedy"],
    rating: 7.8,
    duration: "1h 45m",
    releaseYear: 2024,
    director: "Jane Director",
    featured: false,
    trending: false
  },
  {
    title: "Dark Drama",
    description: "A compelling drama that explores the depths of human emotion.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1518676591709-ec05fabc79a2?w=400",
    category: "Drama",
    genre: ["Drama"],
    rating: 9.0,
    duration: "2h 30m",
    releaseYear: 2023,
    director: "Bob Director",
    featured: false,
    trending: false
  },
  {
    title: "Mystery Manor",
    description: "A gripping TV series following detectives solving impossible cases in a haunted manor.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400",
    category: "TV Shows",
    genre: ["Mystery", "Thriller"],
    rating: 8.9,
    duration: "8 Episodes",
    releaseYear: 2024,
    director: "Sarah Showrunner",
    featured: false,
    trending: true
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
      return;
    }

    console.log('Seeding categories...');
    await Category.bulkCreate(sampleCategories);

    console.log('Seeding movies...');
    await Movie.bulkCreate(sampleMovies);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = seedDatabase;
