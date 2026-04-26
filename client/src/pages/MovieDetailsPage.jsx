import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, ArrowLeft, Star, Clock, Calendar, User as UserIcon, ExternalLink, X, Video } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showFullMovie, setShowFullMovie] = useState(false);
  const [trailerStarted, setTrailerStarted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('[MovieDetailsPage] Fetching movie with id:', id);
        console.log('[MovieDetailsPage] API URL:', `/movies/${id}`);
        
        const [movieData, similarData] = await Promise.all([
          movieService.getById(id),
          movieService.getSimilar(id)
        ]);
        
        console.log('[MovieDetailsPage] Raw movieData:', movieData);
        console.log('[MovieDetailsPage] Raw similarData:', similarData);
        setMovie(movieData);
        setSimilar(similarData);
        
        if (user) {
          const watchlist = await watchlistService.get();
          setInWatchlist(watchlist.some(m => m.id === parseInt(id)));
        }
      } catch (error) {
        console.error('[MovieDetailsPage] Error fetching movie:', error);
        console.error('[MovieDetailsPage] Error response:', error.response?.data);
        console.error('[MovieDetailsPage] Error status:', error.response?.status);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  useEffect(() => {
    if (movie?.trailerUrl && movie.trailerUrl.trim() && !trailerStarted) {
      const timer = setTimeout(() => {
        setShowTrailer(true);
        setTrailerStarted(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [movie, trailerStarted]);

  useEffect(() => {
    if (showTrailer && movie?.trailerUrl && movie.trailerUrl.trim()) {
      const closeOnEnd = (e) => {
        if (e.data === 'VideoEnded') {
          setShowTrailer(false);
          if (movie.externalUrl && movie.externalUrl.trim()) {
            setShowFullMovie(true);
          }
        }
      };
      window.addEventListener('message', closeOnEnd);
      return () => window.removeEventListener('message', closeOnEnd);
    }
  }, [showTrailer, movie]);

  const handleWatchlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      if (inWatchlist) {
        await watchlistService.remove(id);
        setInWatchlist(false);
      } else {
        await watchlistService.add(id);
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

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
          <p className="text-netflix-text-secondary mb-4">ID: {id}</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const trailerId = movie?.trailerUrl?.trim() ? getYouTubeVideoId(movie.trailerUrl) : null;
  const externalUrlId = movie?.externalUrl?.trim() ? getYouTubeVideoId(movie.externalUrl) : null;

  const parseJsonField = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(s => s && s.trim());
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.filter(s => s && s.trim());
      } catch {
        if (value.includes(',')) {
          return value.split(',').map(s => s.trim()).filter(s => s);
        }
        return [value];
      }
    }
    return [];
  };

  const movieGenres = parseJsonField(movie.genre);
  const movieCast = parseJsonField(movie.cast);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      
      {showTrailer && trailerId && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button onClick={() => setShowTrailer(false)} className="absolute top-4 right-4 text-white hover:text-netflix-red z-10">
            <X size={32} />
          </button>
          <div className="w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&controls=1&showinfo=0&modestbranding=1&enablejsapi=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Trailer"
              id="trailer-iframe"
            />
          </div>
        </div>
      )}

      {showFullMovie && movie?.externalUrl && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button onClick={() => setShowFullMovie(false)} className="absolute top-4 right-4 text-white hover:text-netflix-red z-10">
            <X size={32} />
          </button>
          <div className="w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${externalUrlId}?autoplay=1&controls=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
              title="Full Movie"
            />
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-0 h-[60vh] bg-cover bg-center" style={{ backgroundImage: `url(${movie.thumbnail || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920'})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-bg via-netflix-bg/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-bg via-transparent to-netflix-bg"></div>
        </div>

        <div className="relative pt-[40vh] px-4 md:px-12 pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-netflix-text-secondary hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-80 flex-shrink-0 mx-auto lg:mx-0">
              <img 
                src={movie.thumbnail || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400'} 
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
              />
            </div>
            
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
                {movie.views > 0 && (
                  <span className="flex items-center gap-1">
                    <UserIcon size={18} />
                    {Number(movie.views).toLocaleString()} views
                  </span>
                )}
              </div>

              {movieGenres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movieGenres.map((g, i) => (
                    <Link key={i} to={`/search?category=${encodeURIComponent(g)}`} className="px-3 py-1 bg-netflix-bg-tertiary rounded-full text-sm text-netflix-text-secondary hover:text-white transition-colors">
                      {g}
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-netflix-text mb-6 max-w-2xl text-sm md:text-base">{movie.description}</p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {movie?.videoUrl?.trim() ? (
                  <Link to={`/watch/${movie.id}`} className="flex items-center justify-center gap-2 bg-netflix-red text-white px-6 md:px-8 py-3 rounded font-semibold hover:bg-red-700 transition-colors text-lg">
                    <Play size={24} />
                    Watch Online
                  </Link>
                ) : null}
                {movie?.externalUrl?.trim() ? (
                  <a
                    href={movie.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 md:px-8 py-3 rounded font-semibold hover:bg-blue-700 transition-colors text-lg"
                  >
                    <ExternalLink size={24} />
                    Watch Full Movie
                  </a>
                ) : null}
                {trailerId ? (
                  <button onClick={() => setShowTrailer(true)} className="flex items-center justify-center gap-2 bg-gray-700/70 text-white px-6 py-3 rounded font-semibold hover:bg-gray-600 transition-colors">
                    <Video size={24} />
                    Watch Trailer
                  </button>
                ) : null}
                <button onClick={handleWatchlist} className="flex items-center justify-center gap-2 bg-netflix-bg-tertiary/70 text-white px-6 py-3 rounded font-semibold hover:bg-netflix-bg-tertiary transition-colors">
                  {inWatchlist ? <Check size={24} /> : <Plus size={24} />}
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              {movie.director && (
                <div className="mt-6">
                  <p className="text-netflix-text-secondary text-sm">Director</p>
                  <p className="text-white">{movie.director}</p>
                </div>
              )}

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

          {similar.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-6">Similar Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {similar.map(m => (
                  <MovieCard key={m.id} movie={m} onWatchlist={inWatchlist ? [id] : []} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};