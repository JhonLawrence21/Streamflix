import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../../services/api';
import { getThumbnailUrl } from '../../utils/imageUtils';

const HeroBanner = () => {
  const [movie, setMovie] = useState(null);
  const [bgError, setBgError] = useState(false);

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
        <div className="text-center px-4">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Welcome to StreamFlix</h2>
          <p className="text-xl text-netflix-text-secondary mb-8">Discover amazing movies and TV shows</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/search" className="bg-white text-black px-6 md:px-8 py-2.5 md:py-3 rounded font-semibold hover:bg-gray-200 transition-colors text-sm md:text-base">
              Browse Movies
            </Link>
            <Link to="/upcoming" className="bg-netflix-bg-tertiary/70 text-white px-6 md:px-8 py-2.5 md:py-3 rounded font-semibold hover:bg-netflix-bg-tertiary transition-colors text-sm md:text-base">
              Upcoming Releases
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const bgSrc = bgError ? getThumbnailUrl(null, 'hero') : getThumbnailUrl(movie.thumbnail, 'hero');

return (
    <div className="relative h-[85vh] overflow-hidden">
      <img
        src={bgSrc}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => setBgError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-netflix-bg via-netflix-bg/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg via-transparent to-transparent"></div>

      <div className="relative h-full flex items-center px-4 md:px-12">
        <div className="max-w-2xl hero-content">
          <div className="flex items-center gap-3 mb-3">
            {movie.category && (
              <span className="text-netflix-red font-bold text-sm tracking-wide uppercase">{movie.category}</span>
            )}
            {movie.rating > 0 && (
              <span className="text-netflix-success font-semibold text-sm">{movie.rating.toFixed(1)} Rating</span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">{movie.title}</h1>
          
          <div className="flex items-center gap-3 mb-4 text-sm">
            {movie.releaseYear && (
              <span className="text-netflix-text-secondary">{movie.releaseYear}</span>
            )}
            {movie.duration && (
              <span className="text-netflix-text-secondary">{movie.duration}</span>
            )}
            {movie.genre && Array.isArray(movie.genre) && movie.genre.slice(0, 2).map((g, i) => (
              <span key={i} className="text-netflix-text-secondary">{g}{i < 1 && ','}</span>
            ))}
          </div>

          <p className="text-netflix-text mb-6 line-clamp-3 text-lg">{movie.description}</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to={`/watch/${movie.id}`} className="flex items-center justify-center gap-2 bg-white text-black px-6 md:px-8 py-3 md:py-3.5 rounded font-semibold hover:bg-gray-200 transition-all text-sm md:text-base shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Play
            </Link>
            <Link to={`/movie/${movie.id}`} className="flex items-center justify-center gap-2 bg-netflix-bg-tertiary/70 text-white px-6 md:px-8 py-3 md:py-3.5 rounded font-semibold hover:bg-netflix-bg-tertiary transition-all text-sm md:text-base backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

