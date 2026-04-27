import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info } from 'lucide-react';
import { movieService } from '../../services/api';
import { getThumbnailUrl } from '../../utils/imageUtils';

const HeroBanner = () => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await movieService.getFeatured();
        setMovie(data);
      } catch (error) {
        console.error('Error fetching featured movie:', error);
      }
    };
    fetchFeatured();
  }, []);

  if (!movie) {
    return (
      <div className="h-[85vh] bg-netflix-bg flex items-center justify-center">
        <div className="animate-pulse w-20 h-20 bg-netflix-bg-tertiary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="relative h-[85vh] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ backgroundImage: `url(${getThumbnailUrl(movie.thumbnail, 'hero')})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-bg via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg via-transparent to-transparent"></div>
      </div>

      <div className="relative h-full flex items-center px-4 md:px-12">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{movie.title}</h1>
          
          <div className="flex items-center gap-3 mb-4">
            {movie.rating > 0 && (
              <span className="text-netflix-success font-semibold">{movie.rating.toFixed(1)} Rating</span>
            )}
            {movie.releaseYear && (
              <span className="text-netflix-text-secondary">{movie.releaseYear}</span>
            )}
            {movie.duration && (
              <span className="text-netflix-text-secondary">{movie.duration}</span>
            )}
            {movie.featured && (
              <span className="px-2 py-0.5 bg-netflix-red text-xs text-white rounded">Featured</span>
            )}
          </div>

          <p className="text-netflix-text mb-6 line-clamp-3">{movie.description}</p>

          <div className="flex flex-wrap gap-4">
            <Link to={`/watch/${movie.id}`} className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-gray-200 transition-colors">
              <Play size={20} />
              Play
            </Link>
            <Link to={`/movie/${movie.id}`} className="flex items-center justify-center gap-2 bg-netflix-bg-tertiary/70 text-white px-6 py-3 rounded font-semibold hover:bg-netflix-bg-tertiary transition-colors">
              <Info size={20} />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

