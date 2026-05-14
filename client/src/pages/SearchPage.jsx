import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        if (category) {
          const data = await movieService.getByCategory(category);
          setMovies(data || []);
          return;
        }

        const params = {};
        if (query) params.search = query;

        const data = await movieService.getAll(params);
        setMovies(data.movies || data);
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [query, category]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(query ? { q: query } : {});
  };

  const categories = ['All', 'Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Thriller'];

  // Keep UI responsive; backend returns category-filtered movies.
  // If you add categories in Admin, they will still be supported in the backend,
  // but they won't show up in this horizontal chip list unless added here (or
  // fetched dynamically later).


  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      
      <div className="pt-24 px-4 md:px-12 pb-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies..."
                className="input-field pl-12 w-full"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3 sm:py-2">
              Search
            </button>
          </div>
        </form>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => { setCategory(''); setSearchParams(query ? { q: query } : {}); }}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${!category ? 'bg-netflix-red text-white' : 'bg-netflix-bg-tertiary text-netflix-text-secondary hover:text-white'}`}
          >
            All
          </button>
          {categories.filter(c => c !== 'All').map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setSearchParams(query ? { q: query, category: cat } : { category: cat }); }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${category === cat ? 'bg-netflix-red text-white' : 'bg-netflix-bg-tertiary text-netflix-text-secondary hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-netflix-bg-tertiary aspect-[2/3] rounded-lg"></div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-netflix-text-muted mb-4" />
            <h2 className="text-xl text-white mb-2">No results found</h2>
            <p className="text-netflix-text-secondary">
              Try different keywords or browse by category
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl text-white mb-6">
              {query ? `Results for "${query}"` : category ? `${category} Movies` : 'All Movies'}
              {' '}<span className="text-netflix-text-secondary">({movies.length})</span>
            </h2>
            
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
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;