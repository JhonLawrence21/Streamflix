import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Plus, Check, Volume2, VolumeX, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { watchlistService } from '../../services/api';
import { getThumbnailUrl, handleImageError, getYouTubeVideoId } from '../../utils/imageUtils';

const VideoPreview = ({ movie, position, onClose }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const previewRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const trailerId = getYouTubeVideoId(movie.trailerUrl) || getYouTubeVideoId(movie.videoUrl);

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/watch/${movie.id}`);
  };

  const handleDetails = (e) => {
    e.stopPropagation();
    navigate(`/movie/${movie.id}`);
  };

  const [adjustedLeft, setAdjustedLeft] = useState(position.left);

  useEffect(() => {
    if (previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        setAdjustedLeft(position.left - (rect.right - window.innerWidth) - 10);
      } else if (rect.left < 0) {
        setAdjustedLeft(position.left - rect.left + 10);
      } else {
        setAdjustedLeft(position.left);
      }
    }
  }, [position.left]);

  const style = {
    position: 'absolute',
    top: position.top,
    left: adjustedLeft,
    width: '340px',
    zIndex: 1000,
  };

  return (
    <div
      ref={previewRef}
      style={style}
      className="animate-scale-in bg-netflix-bg-secondary rounded-lg shadow-2xl overflow-hidden border border-netflix-bg-tertiary"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <div className="aspect-video bg-black flex items-center justify-center">
          {trailerId ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${trailerId}&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3`}
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
              allow="autoplay; encrypted-media"
              title={`${movie.title} preview`}
            />
          ) : (
            <div className="text-center">
              <Play className="w-16 h-16 text-white/50 mx-auto mb-2" />
              <p className="text-white/70 text-sm">Preview</p>
            </div>
          )}
        </div>

        <div className="absolute top-2 right-2 flex gap-2">
          {trailerId && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              {isMuted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
            </button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
          <h3 className="text-white font-semibold text-sm">{movie.title}</h3>
          <p className="text-gray-300 text-xs mt-1 line-clamp-2">{movie.description}</p>
        </div>
      </div>

      <div className="p-3 flex items-center justify-between bg-netflix-bg-secondary">
        <div className="flex gap-2">
          <button
            onClick={handlePlay}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Play size={16} className="text-black ml-0.5" />
          </button>
          {user && (
            <button className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors">
              <Plus size={16} className="text-white" />
            </button>
          )}
          <button
            onClick={handleDetails}
            className="w-9 h-9 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white hover:bg-white/10 transition-colors"
          >
            <Info size={16} className="text-white" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {movie.rating > 0 && (
            <span className="text-green-400 font-medium">{movie.rating.toFixed(1)}</span>
          )}
          {movie.category && (
            <span className="text-gray-400 border border-gray-500 px-1 rounded text-[10px]">
              {movie.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MovieRow = ({ title, movies, onWatchlist = [], onWatchlistChange }) => {
  const navigate = useNavigate();
  const rowRef = useRef(null);
  const [showButtons, setShowButtons] = useState(false);
  const [localWatchlist, setLocalWatchlist] = useState(onWatchlist);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const [hoverTimeout, setHoverTimeout] = useState(null);
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
    if (onWatchlistChange) onWatchlistChange();
  };

  const handleCardClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handlePlay = (e, movieId) => {
    e.stopPropagation();
    navigate(`/watch/${movieId}`);
  };

  const handleMouseEnter = (e, movie) => {
     if (!e || !e.currentTarget) return;
     const timeout = setTimeout(() => {
       if (!e.currentTarget || !rowRef.current) return;
       let card, row;
       try {
         card = e.currentTarget.getBoundingClientRect();
         row = rowRef.current.getBoundingClientRect();
       } catch {
         return;
       }
       if (!card || !row) return;

       let left = card.left - row.left + card.width / 2 - 170;
       const maxLeft = row.width - 340;
       left = Math.max(0, Math.min(left, maxLeft));

       setHoverPosition({
         top: card.top - row.top - 10,
         left: left
       });
       setHoveredMovie(movie);
     }, 500);

     setHoverTimeout(timeout);
   };

   const handleMouseLeave = () => {
     if (hoverTimeout) {
       clearTimeout(hoverTimeout);
     }
     setHoveredMovie(null);
   };

  if (!movies || movies.length === 0) return null;

  return (
    <div
      className="py-6 md:py-8 px-4 md:px-12 animate-fade-in-up"
      onMouseEnter={() => setShowButtons(true)}
      onMouseLeave={() => {
        setShowButtons(false);
        setHoveredMovie(null);
      }}
    >
      <h2 className="text-lg md:text-2xl font-semibold text-white mb-3 md:mb-4 netflix-row-title hover:text-netflix-red transition-colors cursor-pointer">{title}</h2>

      <div className="relative group">
        {showButtons && movies.length > 4 && (
          <>
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-0 bottom-0 z-20 bg-black/60 p-2 hover:bg-black/80 transition-all duration-300 hidden md:flex items-center opacity-0 group-hover:opacity-100 hover:scale-110 rounded-r"
            >
              <ChevronLeft size={32} className="text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-0 bottom-0 z-20 bg-black/60 p-2 hover:bg-black/80 transition-all duration-300 hidden md:flex items-center opacity-0 group-hover:opacity-100 hover:scale-110 rounded-l"
            >
              <ChevronRight size={32} className="text-white" />
            </button>
          </>
        )}

        <div ref={rowRef} className="flex gap-1.5 md:gap-3 overflow-x-auto scrollbar-hide pb-4 relative -mx-4 px-4 md:mx-0 md:px-0">
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              onClick={() => handleCardClick(movie.id)}
              className="flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-56 group/card cursor-pointer animate-card-entrance"
              style={{ animationDelay: `${index * 80}ms` }}
              onMouseEnter={(e) => handleMouseEnter(e, movie)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 rounded overflow-hidden">
                <div className="relative aspect-[2/3] rounded overflow-hidden bg-netflix-bg-tertiary">
                  <img
                    src={getThumbnailUrl(movie.thumbnail, 'small', movie.title)}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-all duration-500 ease-out group-hover/card:scale-110 group-hover/card:brightness-75"
                    loading="lazy"
                     referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, 'small', movie.title)}
                  />

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
            </div>
          ))}
        </div>

        {hoveredMovie && hoverPosition && typeof hoverPosition.top === 'number' && (
          <VideoPreview
            movie={hoveredMovie}
            position={hoverPosition}
            onClose={() => setHoveredMovie(null)}
          />
        )}
      </div>
    </div>
  );
};

export default MovieRow;