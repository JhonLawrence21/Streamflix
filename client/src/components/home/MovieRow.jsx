import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { watchlistService } from '../../services/api';

const MovieRow = ({ title, movies, onWatchlist = [] }) => {
  const rowRef = useRef(null);
  const [showButtons, setShowButtons] = useState(false);
  const [localWatchlist, setLocalWatchlist] = useState(onWatchlist);
  const { user } = useAuth();

  useEffect(() => {
    setLocalWatchlist(onWatchlist);
  }, [onWatchlist]);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToWatchlist = async (e, movieId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    const isInWatchlist = localWatchlist.includes(movieId);
    try {
      if (isInWatchlist) {
        await watchlistService.remove(movieId);
        setLocalWatchlist(prev => prev.filter(id => id !== movieId));
      } else {
        await watchlistService.add(movieId);
        setLocalWatchlist(prev => [...prev, movieId]);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div 
      className="py-8 px-4 md:px-12"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">{title}</h2>
      
      <div className="relative group">
        {showButtons && movies.length > 4 && (
          <>
            <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-10 bg-black/50 p-2 hover:bg-black/70 transition-colors hidden md:flex items-center">
              <ChevronLeft size={32} />
            </button>
            <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-10 bg-black/50 p-2 hover:bg-black/70 transition-colors hidden md:flex items-center">
              <ChevronRight size={32} />
            </button>
          </>
        )}
        
        <div ref={rowRef} className="flex gap-2 overflow-x-auto scrollbar-hide pb-4">
          {movies.map((movie) => (
            <Link 
              key={movie.id} 
              to={`/movie/${movie.id}`}
              className="flex-shrink-0 w-36 sm:w-40 md:w-48 group/card relative"
            >
              <div className="relative aspect-[2/3] rounded overflow-hidden bg-netflix-bg-tertiary">
                <img 
                  src={movie.thumbnail || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400'} 
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-110"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <Link to={`/watch/${movie.id}`} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                    <Play size={20} className="text-black ml-1" />
                  </Link>
                  {user && (
                    <button 
                      onClick={(e) => handleAddToWatchlist(e, movie.id)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${localWatchlist.includes(movie.id) ? 'bg-netflix-red border-netflix-red' : 'border-white hover:border-netflix-red'}`}
                    >
                      {localWatchlist.includes(movie.id) ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-netflix-text-secondary">
                    {movie.rating > 0 && <span>{movie.rating.toFixed(1)}</span>}
                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieRow;