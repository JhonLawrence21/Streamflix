import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CategoryPage = () => {
  const { name } = useParams();
  const location = useLocation();
  const isTvShows = location.pathname === '/tv-shows';
  const categoryName = isTvShows ? 'TV Shows' : name;
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await movieService.getByCategory(categoryName);
        setMovies(data || []);
      } catch (error) {
        console.error(`Error fetching ${categoryName} movies:`, error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchMovies();
    }
  }, [categoryName]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user) {
        try {
          const data = await watchlistService.get();
          setWatchlist(data.map(m => m.id));
        } catch (error) {
          console.error('Error fetching watchlist:', error);
        }
      }
    };

    fetchWatchlist();
  }, [user]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse bg-netflix-bg-tertiary aspect-[2/3] rounded-lg"></div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl text-white mb-2">No movies found</h2>
            <p className="text-netflix-text-secondary">
              There are no movies in this category yet.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl text-white mb-6">
              {categoryName} <span className="text-netflix-text-secondary">({movies.length})</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onWatchlist={watchlist}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;