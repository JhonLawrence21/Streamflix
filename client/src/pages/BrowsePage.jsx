import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GENRES, COUNTRIES, YEARS } from '../utils/filterOptions';

const BrowsePage = () => {
  const location = useLocation();
  const isTvShows = location.pathname === '/tv-shows';
  const contentType = isTvShows ? 'tv' : 'movie';
  const contentLabel = isTvShows ? 'TV Shows' : 'Movies';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState('All');
  const [country, setCountry] = useState('All');
  const [year, setYear] = useState('All');
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = { type: contentType };
        if (genre !== 'All') params.genre = genre;
        if (country !== 'All') params.country = country;
        if (year !== 'All') params.year = year;
        const data = await movieService.browse(params);
        setMovies(data || []);
      } catch (error) {
        console.error(`Error fetching ${contentLabel}:`, error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [contentType, genre, country, year, contentLabel]);

  const fetchWatchlist = useCallback(async () => {
    if (user) {
      try {
        const data = await watchlistService.get();
        setWatchlist(Array.isArray(data) ? data.map(m => m.id) : []);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{contentLabel}</h1>

        <div className="flex flex-wrap gap-3 mb-8">
          <div>
            <label className="block text-netflix-text-secondary text-xs mb-1">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="px-3 py-2 bg-netflix-bg-tertiary rounded text-white border border-transparent focus:outline-none focus:border-netflix-red text-sm"
            >
              <option value="All">All</option>
              {GENRES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-netflix-text-secondary text-xs mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="px-3 py-2 bg-netflix-bg-tertiary rounded text-white border border-transparent focus:outline-none focus:border-netflix-red text-sm"
            >
              <option value="All">All</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-netflix-text-secondary text-xs mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="px-3 py-2 bg-netflix-bg-tertiary rounded text-white border border-transparent focus:outline-none focus:border-netflix-red text-sm"
            >
              <option value="All">All</option>
              {YEARS.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse bg-netflix-bg-tertiary aspect-[2/3] rounded-lg"></div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl text-white mb-2">No {contentLabel.toLowerCase()} found</h2>
            <p className="text-netflix-text-secondary">
              Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {movies.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onWatchlist={watchlist}
                onWatchlistChange={fetchWatchlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;