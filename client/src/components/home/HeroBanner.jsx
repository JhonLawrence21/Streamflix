import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { movieService } from '../../services/api';
import { getThumbnailUrl } from '../../utils/imageUtils';

const HeroBanner = () => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bgErrors, setBgErrors] = useState({});

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await movieService.getFeaturedAll();
        setMovies(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching featured movies:', error);
      }
    };
    fetchSlides();
  }, []);

  const goTo = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % movies.length);
  }, [movies.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + movies.length) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length < 2) return;
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [movies.length, goNext]);

  if (movies.length === 0) {
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

  const movie = movies[currentIndex];

  return (
    <div className="relative h-[70vh] md:h-[85vh] overflow-hidden">
      {movies.map((m, i) => (
        <div
          key={m.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === currentIndex ? 'opacity-100' : 'opacity-0'}`}
        >
          <img
            src={bgErrors[m.id] ? getThumbnailUrl(null, 'hero') : getThumbnailUrl(m.thumbnail, 'hero', m.title)}
            alt={m.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setBgErrors(prev => ({ ...prev, [m.id]: true }))}
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-netflix-bg via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg via-transparent to-transparent"></div>

      {movies.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <div className="relative h-full flex items-center px-4 md:px-12 pt-16">
        <div className="max-w-xl">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-3 md:mb-4">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
            {movie.rating > 0 && (
              <span className="text-netflix-success font-semibold text-sm md:text-base">{movie.rating.toFixed(1)} Rating</span>
            )}
            {movie.releaseYear && (
              <span className="text-netflix-text-secondary text-sm md:text-base">{movie.releaseYear}</span>
            )}
            {movie.duration && (
              <span className="text-netflix-text-secondary text-sm md:text-base">{movie.duration}</span>
            )}
            {movie.featured && (
              <span className="px-2 py-0.5 bg-netflix-red text-xs text-white rounded">Featured</span>
            )}
          </div>

          <p className="text-netflix-text mb-4 md:mb-6 line-clamp-2 md:line-clamp-3 text-sm md:text-base">{movie.description}</p>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Link to={`/watch/${movie.id}`} className="flex items-center justify-center gap-2 bg-white text-black px-5 md:px-6 py-3 md:py-3 rounded font-semibold hover:bg-gray-200 transition-colors text-sm md:text-base">
              <Play size={18} /> Play
            </Link>
            <Link to={`/movie/${movie.id}`} className="flex items-center justify-center gap-2 bg-netflix-bg-tertiary/70 text-white px-5 md:px-6 py-3 md:py-3 rounded font-semibold hover:bg-netflix-bg-tertiary transition-colors text-sm md:text-base">
              <Info size={18} /> More Info
            </Link>
          </div>
        </div>
      </div>

      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-8 bg-netflix-red' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroBanner;
