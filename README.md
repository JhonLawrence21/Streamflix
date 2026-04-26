# StreamFlix - Video Streaming Platform

A Netflix-style full-stack video streaming platform built with React.js, Node.js, and MongoDB.

## Features

### User Features
- Landing page with featured movie hero banner
- Movie browsing by categories (Trending, Action, Drama, Comedy, etc.)
- Movie cards with hover previews
- Movie details page with ratings, cast, and description
- Video player with playback controls
- User authentication (login/register)
- Watchlist management
- Search functionality
- Fully responsive design

### Admin Features
- Admin dashboard with analytics
- Movie management (add/edit/delete)
- User management
- Featured content selection

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router, Framer Motion, React Player
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Storage:** Cloudinary/Firebase (for video uploads)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd streamflix
```

### 2. Install all dependencies
```bash
npm run install:all
```

Or manually:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server` directory:

```env
MONGO_URI=mongodb://localhost:27017/streamflix
JWT_SECRET=your_secret_key_here
PORT=5000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Set up MongoDB

#### Option A: Local MongoDB
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/streamflix`

#### Option B: MongoDB Atlas
1. Create an account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URI` in `.env`

### 5. Seed the database (optional)
```bash
cd server
node seed.js
```

This will add sample movies and categories.

### 6. Start the application

#### Development mode
```bash
npm run dev
```

This starts both server (port 5000) and client (port 3000).

#### Separate terminals
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm start
```

## Folder Structure

```
streamflix/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/      # React context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── tailwind.config.js
│   └── package.json
├── server/                   # Node.js backend
│   ├── config/         # Database config
│   ├── controllers/    # Route controllers
│   ├── middleware/    # Auth middleware
│   ├── models/        # Mongoose models
│   ├── routes/       # API routes
│   ├── seed.js       # Database seeder
│   ├── server.js     # Express server
│   └── package.json
├── package.json             # Root config
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Movies
- `GET /api/movies` - Get all movies (with pagination)
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/movies/featured` - Get featured movie
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/category/:category` - Get movies by category

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist/:movieId` - Add to watchlist
- `DELETE /api/watchlist/:movieId` - Remove from watchlist

### Admin (requires admin role)
- `GET /api/admin/movies` - Get all movies
- `POST /api/admin/movies` - Create movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie
- `GET /api/admin/categories` - Get categories
- `POST /api/admin/categories` - Create category
- `GET /api/admin/users` - Get users
- `GET /api/admin/analytics` - Get analytics

## Default Admin Account

After seeding, login with:
- Email: admin@streamflix.com
- Password: admin123

To create an admin manually:
```javascript
// In MongoDB shell or create a user with role: 'admin'
```

## Video Storage

The application uses URL references for videos. For production:
1. Upload videos to Cloudinary or Firebase Storage
2. Use the video URLs in the admin panel

Sample video URLs are provided in the seed data for testing.

## Design

- **Theme:** Dark Netflix-style (#141414 background)
- **Accent Color:** Netflix Red (#E50914)
- **Fonts:** Netflix Sans / Helvetica

## Troubleshooting

### MongoDB connection error
- Make sure MongoDB is running
- Check your MONGO_URI in `.env`

### Port already in use
- Server runs on port 5000 by default
- Client runs on port 3000 by default
- Change ports in respective package.json files if needed

### JWT errors
- Check JWT_SECRET in server `.env`
- Ensure you're sending the token in headers

## License

ISC