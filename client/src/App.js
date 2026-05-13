import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ParentalControlsProvider } from './context/ParentalControlsContext';
import HomePage from './pages/HomePage';
import MovieDetailsPage from './pages/MovieDetailsPage';
import WatchPage from './pages/WatchPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SearchPage from './pages/SearchPage';
import WatchlistPage from './pages/WatchlistPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminMoviesPage from './pages/admin/AdminMoviesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import ProfilePage from './pages/ProfilePage';
import UpcomingReleasesPage from './pages/UpcomingReleasesPage';
import ProfilesPage from './pages/ProfilesPage';
import DownloadsPage from './pages/DownloadsPage';
import CategoryPage from './pages/CategoryPage';

function App() {
  return (
    <AuthProvider>
      <ParentalControlsProvider>
        <Router>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MovieDetailsPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profiles" element={<ProfilesPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
           <Route path="/upcoming" element={<UpcomingReleasesPage />} />
           <Route path="/category/:name" element={<CategoryPage />} />
           <Route path="/tv-shows" element={<CategoryPage />} />
            
            <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="movies" element={<AdminMoviesPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
        </Router>
      </ParentalControlsProvider>
    </AuthProvider>
  );
}

export default App;