# StreamFlix - Video Streaming Platform Specification

## 1. Project Overview

**Project Name:** StreamFlix  
**Type:** Full-stack video streaming web application  
**Core Functionality:** Netflix-style video streaming platform with movie browsing, playback, watchlist management, and admin content management  
**Target Users:** General consumers seeking video streaming services; Administrators managing content

---

## 2. Technical Stack

### Frontend
- React.js 18
- Tailwind CSS 3
- React Router v6
- Framer Motion (animations)
- Axios (HTTP client)
- React Player (video playback)
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (authentication)
- bcryptjs (password hashing)
- Multer (file uploads)
- Cloudinary (cloud storage for videos/images)

### Database
- MongoDB (hosted locally or Atlas)

---

## 3. UI/UX Specification

### Color Palette
- **Background Primary:** #141414 (Netflix dark)
- **Background Secondary:** #1f1f1f
- **Background Tertiary:** #2a2a2a
- **Accent Red:** #E50914 (Netflix red)
- **Accent Red Hover:** #b2070f
- **Text Primary:** #ffffff
- **Text Secondary:** #b3b3b3
- **Text Muted:** #808080
- **Success:** #46d369
- **Warning:** #ffa00a

### Typography
- **Font Family:** 'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif
- **Heading 1:** 3rem (48px), font-weight: 700
- **Heading 2:** 2rem (32px), font-weight: 600
- **Heading 3:** 1.5rem (24px), font-weight: 600
- **Body:** 1rem (16px), font-weight: 400
- **Small:** 0.875rem (14px), font-weight: 400

### Spacing System
- **Base unit:** 4px
- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64, 96

### Responsive Breakpoints
- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

---

## 4. Page Structure

### 4.1 Landing Page (Home)
- **Navbar:** Fixed top, transparent to solid on scroll
  - Logo (left)
  - Navigation links: Home, TV Shows, Movies, My List
  - Search bar (center, expandable)
  - Profile icon (right)
- **Hero Banner:**
  - Full-width featured movie backdrop
  - Title, description, rating
  - Play and More Info buttons
  - Autoplay trailer option
- **Content Rows:**
  - Trending Now (horizontal scroll)
  - Popular on StreamFlix
  - Action Movies
  - Drama Movies
  - Comedy Movies
  - Horror Movies

### 4.2 Movie Details Page
- Hero backdrop with gradient overlay
- Movie poster thumbnail
- Title, year, rating, duration
- Genre/category tags
- Cast information
- Description/synopsis
- Play button (stream movie)
- Add to Watchlist button
- Similar movies row

### 4.3 Video Player Page
- Full-screen video player
- Playback controls (play/pause, seek, volume, fullscreen)
- Movie title overlay
- Progress bar with thumbnails

### 4.4 Authentication Pages
- **Login:** Email, password, remember me, forgot password link
- **Register:** Name, email, password, confirm password
- Netflix-style glassmorphism form design

### 4.5 User Profile
- Profile avatar (editable)
- Account settings
- Watchlist display
- View history

### 4.6 Search Results
- Search input with filters
- Grid of movie results

### 4.7 Admin Panel
- **Dashboard:** Analytics cards, charts
- **Movie Management:** Table with add/edit/delete
- **Category Management:** CRUD for genres
- **User Management:** User list table
- **Upload:** Video, thumbnail, metadata form

---

## 5. Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  profileImage: String (URL),
  role: String (enum: 'user', 'admin'),
  watchlist: [ObjectId] (ref: 'Movie'),
  createdAt: Date,
  updatedAt: Date
}
```

### Movies Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  videoUrl: String (required),
  thumbnail: String,
  category: String,
  genre: [String],
  rating: Number (0-10),
  duration: String,
  releaseYear: Number,
  cast: [String],
  director: String,
  featured: Boolean (default: false),
  views: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String,
  createdAt: Date
}
```

---

## 6. API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/admin/login` - Admin login

### Movies
- `GET /api/movies` - Get all movies (with pagination, filters)
- `GET /api/movies/:id` - Get single movie
- `GET /api/movies/featured` - Get featured movie
- `GET /api/movies/category/:category` - Get by category
- `GET /api/movies/trending` - Get trending

### Admin Movies
- `POST /api/admin/movies` - Create movie
- `PUT /api/admin/movies/:id` - Update movie
- `DELETE /api/admin/movies/:id` - Delete movie

### Watchlist
- `GET /api/watchlist` - Get user watchlist
- `POST /api/watchlist/:movieId` - Add to watchlist
- `DELETE /api/watchlist/:movieId` - Remove from watchlist

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/admin/categories` - Create category
- `DELETE /api/admin/categories/:id` - Delete category

### Analytics
- `GET /api/admin/analytics` - Get dashboard stats

---

## 7. Component Architecture

### Frontend Components
```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   └── ProtectedRoute.jsx
│   ├── home/
│   │   ├── HeroBanner.jsx
│   │   ├── MovieRow.jsx
│   │   └── MovieCard.jsx
│   ├── movie/
│   │   ├── MovieDetails.jsx
│   │   ├── VideoPlayer.jsx
│   │   └── SimilarMovies.jsx
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   ├── admin/
│   │   ├── Sidebar.jsx
│   │   ├── MovieTable.jsx
│   │   ├── UploadForm.jsx
│   │   └── StatsCard.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       ├── Loader.jsx
│       └── Toast.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── MovieDetailsPage.jsx
│   ├── WatchPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── ProfilePage.jsx
│   ├── SearchPage.jsx
│   ├── WatchlistPage.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminMovies.jsx
│   ├── AdminCategories.jsx
│   └── AdminUsers.jsx
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useMovies.js
├── services/
│   ├── api.js
│   └── authService.js
└── utils/
    ├── constants.js
    └── helpers.js
```

### Backend Structure
```
server/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── movieController.js
│   ├── watchlistController.js
│   └── adminController.js
├── models/
│   ├── User.js
│   ├── Movie.js
│   └── Category.js
├── routes/
│   ├── auth.js
│   ├── movies.js
│   ├── watchlist.js
│   └── admin.js
├── middleware/
│   ├── auth.js
│   └── admin.js
├── utils/
│   └── cloudinary.js
└── server.js
```

---

## 8. Animations

- **Page transitions:** Fade in/out (300ms)
- **Hero banner:** Ken Burns effect on background
- **Movie cards:** Scale up on hover (1.1x), reveal preview
- **Buttons:** Scale (0.95x) on click
- **Rows:** Slide left/right on scroll
- **Loading:** Skeleton screens with shimmer effect

---

## 9. Acceptance Criteria

### User Features
- [ ] Landing page displays hero banner with featured movie
- [ ] Movies organized in horizontal scrolling rows by category
- [ ] Movie cards show hover effects with preview
- [ ] Click on movie navigates to details page
- [ ] Video player plays movies with controls
- [ ] User can register and login
- [ ] User can manage watchlist
- [ ] Search returns relevant results
- [ ] Fully responsive on mobile/tablet/desktop

### Admin Features
- [ ] Admin dashboard shows analytics
- [ ] Admin can upload new movies
- [ ] Admin can edit/delete movies
- [ ] Admin can manage categories
- [ ] Admin can view users list

### Technical
- [ ] JWT authentication works correctly
- [ ] Role-based access control enforced
- [ ] API handles errors gracefully
- [ ] Video streaming loads smoothly
- [ ] Lazy loading for images
- [ ] Dark theme consistent throughout