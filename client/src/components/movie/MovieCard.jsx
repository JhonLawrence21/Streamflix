import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Plus, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { watchlistService } from '../../services/api';
import { getThumbnailUrl, handleImageError } from '../../utils/imageUtils';

const MovieCard = ({ movie, onWatchlist = [] }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInWatchlist, setIsInWatchlist] = useState(onWatchlist.includes(movie.id));
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setIsInWatchlist(onWatchlist.includes(movie.id));
  }, [onWatchlist, movie.id]);

  useEffect(() => {
    setImageError(false);
  }, [movie.id]);

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

  const thumbnailSrc = imageError
    ? getThumbnailUrl(null)
    : getThumbnailUrl(movie.thumbnail);

  return (
    <div 
      onClick={handleCardClick}
      className="block group cursor-pointer"
    >
      <div className="relative aspect-[2/3] rounded overflow-hidden bg-netflix-bg-tertiary">
        <img 
          src={thumbnailSrc}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          
          onError={(e) => {
            setImageError(true);
            handleImageError(e);
          }}
        />
        
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
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

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
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

