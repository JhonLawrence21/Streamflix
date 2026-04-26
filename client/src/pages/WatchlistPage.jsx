import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bookmark } from 'lucide-react';

const WatchlistPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const data = await watchlistService.get();
        setMovies(data);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] px-4">
          <Bookmark size={64} className="text-netflix-text-muted mb-4" />
          <h1 className="text-2xl text-white mb-4">Sign in to see your watchlist</h1>
          <p className="text-netflix-text-secondary mb-6">Save movies to your watchlist to keep track of what you want to watch.</p>
          <Link to="/login" className="btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12 pb-8">
        <h1 className="text-3xl font-bold text-white mb-8">My Watchlist</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-netflix-bg-tertiary aspect-[2/3] rounded-lg"></div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark size={48} className="mx-auto text-netflix-text-muted mb-4" />
            <h2 className="text-xl text-white mb-2">Your watchlist is empty</h2>
            <p className="text-netflix-text-secondary mb-6">
              Save movies by clicking the + button on any movie card
            </p>
            <Link to="/" className="btn-primary">Browse Movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} onWatchlist={movies.map(m => m.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;