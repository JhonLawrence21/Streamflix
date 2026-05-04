import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { watchlistService } from '../../services/api';
import { getThumbnailUrl, handleImageError } from '../../utils/imageUtils';

const ThumbnailWithFallback = ({ movie }) => {
  const [imageError, setImageError] = useState(false);

  const src = imageError || !movie.thumbnail
    ? getThumbnailUrl(null)
    : getThumbnailUrl(movie.thumbnail);

  return (
    <div className="relative aspect-[2/3] rounded overflow-hidden bg-netflix-bg-tertiary">
      <img
        src={src}
        alt={movie.title}
        className="w-full h-full object-cover transition-all duration-500 ease-out group-hover/card:scale-110 group-hover/card:brightness-75"
        loading="lazy"
        onError={(e) => {
          setImageError(true);
          handleImageError(e);
        }}
      />
    </div>
  );
};

const MovieRow = ({ title, movies, onWatchlist = [] }) => {
  const navigate = useNavigate();
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

  const handleCardClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handlePlay = (e, movieId) => {
    e.stopPropagation();
    navigate(`/watch/${movieId}`);
  };

if (!movies || movies.length === 0) {
  return (
    <div className="py-8 px-4 md:px-12">
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">{title}</h2>
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-pulse w-16 h-16 bg-netflix-bg-tertiary rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-netflix-text-secondary">No {title.toLowerCase()} movies available</p>
        </div>
      </div>
    </div>
  );
};

  return (
    <div
      className="py-8 px-4 md:px-12 animate-fade-in-up"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => setShowButtons(false)}
    >
      <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 animate-slide-in-left">{title}</h2>

      <div className="relative group">
        {showButtons && movies.length > 4 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-0 bottom-0 z-10 bg-black/60 p-2 hover:bg-black/80 transition-all duration-300 hidden md:flex items-center opacity-0 group-hover:opacity-100 hover:scale-110 rounded-r"
            >
              <ChevronLeft size={32} className="text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-0 bottom-0 z-10 bg-black/60 p-2 hover:bg-black/80 transition-all duration-300 hidden md:flex items-center opacity-0 group-hover:opacity-100 hover:scale-110 rounded-l"
            >
              <ChevronRight size={32} className="text-white" />
            </button>
          </>
        )}

        <div ref={rowRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-4">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              onClick={() => handleCardClick(movie.id)}
              className="flex-shrink-0 w-36 sm:w-40 md:w-48 group/card relative cursor-pointer animate-card-entrance"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 rounded overflow-hidden">
                <ThumbnailWithFallback movie={movie} />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-3">
                  <button
                    onClick={(e) => handlePlay(e, movie.id)}
                    className="w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-125 transition-transform duration-300 shadow-lg"
                  >
                    <Play size={24} className="text-black ml-1" />
                  </button>
                  {user && (
                    <button
                      onClick={(e) => handleAddToWatchlist(e, movie.id)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 ${localWatchlist.includes(movie.id) ? 'bg-netflix-red border-netflix-red' : 'border-white hover:border-netflix-red hover:bg-white/10'}`}
                    >
                      {localWatchlist.includes(movie.id) ? <Check size={18} className="text-white" /> : <Plus size={18} className="text-white" />}
                    </button>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                  <h3 className="text-sm font-bold text-white truncate drop-shadow-md">{movie.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                    {movie.rating > 0 && <span className="text-green-400 font-semibold">{movie.rating.toFixed(1)}</span>}
                    {movie.releaseYear && <span>{movie.releaseYear}</span>}
                    {movie.duration && <span className="text-gray-400">{movie.duration}</span>}
                  </div>
                  {movie.category && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-netflix-red/80 text-white text-[10px] rounded-full uppercase tracking-wide">
                      {movie.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MovieRow;

