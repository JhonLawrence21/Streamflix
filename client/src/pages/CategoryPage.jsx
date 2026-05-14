import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COUNTRIES, YEARS } from '../utils/filterOptions';

const CategoryPage = () => {
  const { name } = useParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState('All');
  const [year, setYear] = useState('All');
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const data = await movieService.getByCategory(name);
        setMovies(data || []);
      } catch (error) {
        console.error(`Error fetching ${name} movies:`, error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    if (name) {
      fetchMovies();
    }
  }, [name]);

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

  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      if (country !== 'All') {
        if (country === 'Other') {
          const known = ['United States', 'United Kingdom', 'Korea', 'Japan', 'Bangladesh', 'China', 'Egypt', 'France', 'Germany', 'India', 'Indonesia', 'Iraq', 'Italy', 'Ivory Coast', 'Kenya', 'Lebanon', 'Mexico', 'Morocco', 'Nigeria', 'Pakistan', 'Philippines', 'Russia', 'Saudi Arabia', 'South Africa', 'Spain', 'Syria', 'Thailand', 'Malaysia', 'Turkey'];
          if (m.country && known.includes(m.country)) return false;
        } else if (m.country !== country) {
          return false;
        }
      }
      if (year !== 'All') {
        const ry = m.releaseYear;
        if (year === 'Other') {
          if (ry && ry >= 1980) return false;
        } else if (year.endsWith('s')) {
          const decade = parseInt(year.slice(0, -1));
          if (!ry || ry < decade || ry > decade + 9) return false;
        } else if (ry !== parseInt(year)) {
          return false;
        }
      }
      return true;
    });
  }, [movies, country, year]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 pb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">{name}</h1>

        <div className="flex flex-wrap gap-3 mb-8">
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
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-xl text-white mb-2">No movies found</h2>
            <p className="text-netflix-text-secondary">
              {movies.length === 0 ? 'There are no movies in this category yet.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl text-white mb-6">
              {name} <span className="text-netflix-text-secondary">({filteredMovies.length})</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onWatchlist={watchlist}
                  onWatchlistChange={fetchWatchlist}
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