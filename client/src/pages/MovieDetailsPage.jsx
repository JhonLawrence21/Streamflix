import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Clock, Plus, Check, ExternalLink, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeWatchUrl, getThumbnailUrl, handleImageError, isYouTubeUrl } from '../utils/imageUtils';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [movieResult, similarResult, watchlistResult] = await Promise.allSettled([
          movieService.getById(id),
          movieService.getSimilar(id),
          user ? watchlistService.get() : Promise.resolve([])
        ]);

        if (movieResult.status === 'fulfilled') {
          setMovie(movieResult.value);
        } else {
          console.error('Failed to fetch movie:', movieResult.reason);
          setMovie(null);
        }

        if (similarResult.status === 'fulfilled') {
          setSimilar(similarResult.value);
        } else {
          console.error('Failed to fetch similar movies:', similarResult.reason);
          setSimilar([]);
        }

        if (watchlistResult.status === 'fulfilled') {
          const watchlistData = watchlistResult.value;
          const ids = Array.isArray(watchlistData)
            ? watchlistData.map(m => m.id)
            : [];
          setWatchlistIds(ids);
          setInWatchlist(ids.includes(parseInt(id)));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await watchlistService.remove(id);
        setInWatchlist(false);
      } else {
        await watchlistService.add(id);
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const trailerId = getYouTubeVideoId(movie?.trailerUrl);
  const externalUrl = movie?.externalUrl?.trim() || '';
  const externalIsYouTube = isYouTubeUrl(externalUrl);
  const externalYouTubeId = externalIsYouTube ? getYouTubeVideoId(externalUrl) : null;
  const externalHref = externalYouTubeId 
    ? getYouTubeWatchUrl(externalYouTubeId) 
    : externalUrl;

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl text-white mb-4">Movie not found</h1>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const movieCast = Array.isArray(movie.cast) ? movie.cast : [];
  const movieGenre = Array.isArray(movie.genre) ? movie.genre : [];

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      
      {/* Header with thumbnail background */}
      <div className="relative">
        <div 
          className="absolute inset-0 h-[60vh] bg-cover bg-center" 
          style={{ backgroundImage: `url(${getThumbnailUrl(movie.thumbnail, 'hero')})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-bg via-netflix-bg/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg via-transparent to-netflix-bg"></div>
        </div>

        <div className="relative pt-[40vh] px-4 md:px-12 pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-netflix-text-secondary hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Thumbnail */}
            <div className="w-full lg:w-80 flex-shrink-0 mx-auto lg:mx-0">
              <img 
                src={getThumbnailUrl(movie.thumbnail, 'detail')} 
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
                onError={handleImageError}
              />
            </div>
            
            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 text-netflix-text-secondary text-sm md:text-base">
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1 text-netflix-warning">
                    <Star size={18} fill="currentColor" />
                    {Number(movie.rating).toFixed(1)}/10
                  </span>
                )}
                {movie.releaseYear && (
                  <span className="flex items-center gap-1">
                    <Calendar size={18} />
                    {movie.releaseYear}
                  </span>
                )}
                {movie.duration && (
                  <span className="flex items-center gap-1">
                    <Clock size={18} />
                    {movie.duration}
                  </span>
                )}
                {movie.category && (
                  <span className="px-3 py-1 bg-netflix-bg-tertiary rounded-full text-xs">{movie.category}</span>
                )}
              </div>

              {movie.description && (
                <p className="text-netflix-text-secondary text-sm md:text-lg mb-6 max-w-2xl">{movie.description}</p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                {/* Watch Online Button */}
                <Link to={`/watch/${movie.id}`} className="flex items-center justify-center gap-2 bg-netflix-red text-white px-6 md:px-8 py-3 rounded font-semibold hover:bg-red-700 transition-colors text-lg">
                  <Play size={24} />
                  Watch Online
                </Link>

                {/* Watch Full Movie (External) */}
                {externalUrl && (
                  <a
                    href={externalHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 md:px-8 py-3 rounded font-semibold hover:bg-blue-700 transition-colors text-lg"
                  >
                    <ExternalLink size={24} />
                    Watch Full Movie
                  </a>
                )}

                {/* Watch Trailer */}
                {trailerId && (
                  <button 
                    onClick={() => {
                      setShowTrailer(true);
                    }} 
                    className="flex items-center justify-center gap-2 bg-gray-700/70 text-white px-6 py-3 rounded font-semibold hover:bg-gray-600 transition-colors"
                  >
                    <Play size={24} />
                    Watch Trailer
                  </button>
                )}

                {/* Add to Watchlist */}
                <button 
                  onClick={handleWatchlist} 
                  className="flex items-center justify-center gap-2 bg-netflix-bg-tertiary/70 text-white px-6 py-3 rounded font-semibold hover:bg-netflix-bg-tertiary transition-colors"
                >
                  {inWatchlist ? <Check size={24} /> : <Plus size={24} />}
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              {/* Director */}
              {movie.director && (
                <div className="mt-6">
                  <p className="text-netflix-text-secondary text-sm">Director</p>
                  <p className="text-white">{movie.director}</p>
                </div>
              )}

              {/* Cast */}
              {movieCast.length > 0 && (
                <div className="mt-4">
                  <p className="text-netflix-text-secondary text-sm mb-2">Cast</p>
                  <div className="flex flex-wrap gap-2">
                    {movieCast.map((c, i) => (
                      <span key={i} className="px-3 py-1 bg-netflix-bg-tertiary rounded-full text-sm text-netflix-text-secondary">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies */}
      {similar.length > 0 && (
        <div className="mt-12 px-4 md:px-12 pb-8">
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">Similar Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            {similar.map(m => (
              <MovieCard key={m.id} movie={m} onWatchlist={watchlistIds} />
            ))}
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && trailerId && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button onClick={() => setShowTrailer(false)} className="absolute top-4 right-4 text-white p-2">
            <X size={32} />
          </button>
          <iframe
            src={getYouTubeEmbedUrl(trailerId, true)}
            className="w-full h-full max-w-4xl aspect-video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Trailer"
          />
        </div>
      )}
    </div>
  );
};

export default MovieDetailsPage;

