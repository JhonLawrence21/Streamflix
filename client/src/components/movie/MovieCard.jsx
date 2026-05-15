import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { watchlistService } from '../../services/api';
import { getThumbnailUrl, handleImageError, getYouTubeVideoId } from '../../utils/imageUtils';

const MovieCard = ({ movie, onWatchlist = [], onWatchlistChange }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(onWatchlist.includes(movie.id));
  const [imageError, setImageError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimer = useRef(null);
  const cardRef = useRef(null);

  const trailerId = getYouTubeVideoId(movie.trailerUrl) || getYouTubeVideoId(movie.videoUrl);

  useEffect(() => {
    setIsInWatchlist(onWatchlist.includes(movie.id));
  }, [onWatchlist, movie.id]);

  useEffect(() => {
    setImageError(false);
  }, [movie.id]);

  useEffect(() => {
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      if (isInWatchlist) {
        await watchlistService.remove(movie.id);
        setIsInWatchlist(false);
      } else {
        await watchlistService.add(movie.id);
        setIsInWatchlist(true);
      }
      if (onWatchlistChange) onWatchlistChange();
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handlePlay = (e) => {
    e.stopPropagation();
    navigate(`/watch/${movie.id}`);
  };

  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleMouseEnter = () => {
    if (!trailerId) return;
    hoverTimer.current = setTimeout(() => {
      setShowPreview(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setShowPreview(false);
  };

  const thumbnailSrc = imageError
    ? getThumbnailUrl(null)
    : getThumbnailUrl(movie.thumbnail);

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="block group cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-netflix-bg-tertiary">
        {showPreview && trailerId ? (
          <iframe
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&mute=1&loop=1&playlist=${trailerId}&rel=0&modestbranding=1&controls=0&playsinline=1`}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            title={`${movie.title} preview`}
          />
        ) : (
          <img
            src={thumbnailSrc}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              setImageError(true);
              handleImageError(e);
            }}
          />
        )}

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
          <button
            onClick={handlePlay}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Play size={20} className="text-black ml-1" />
          </button>
          {user && (
            <button
              onClick={handleAddToWatchlist}
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${isInWatchlist ? 'bg-netflix-red border-netflix-red' : 'border-white hover:border-netflix-red'}`}
            >
              {isInWatchlist ? <Check size={16} /> : <Plus size={16} />}
            </button>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent z-10">
          <h3 className="text-sm font-medium text-white truncate">{movie.title}</h3>
          <div className="flex items-center gap-2 text-xs text-netflix-text-secondary mt-1">
            {movie.rating > 0 && <span className="text-netflix-success">{movie.rating.toFixed(1)}</span>}
            {movie.releaseYear && <span>{movie.releaseYear}</span>}
            {movie.category && <span className="px-1.5 py-0.5 bg-netflix-bg-tertiary rounded text-xs">{movie.category}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;