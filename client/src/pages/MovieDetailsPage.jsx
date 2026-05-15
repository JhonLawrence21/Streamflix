import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Star, Calendar, Clock, Plus, Check, ExternalLink, X, CheckCircle, Flag } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService, watchlistService, adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getYouTubeVideoId, getYouTubeWatchUrl, getThumbnailUrl, handleImageError, isYouTubeUrl } from '../utils/imageUtils';

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

  const [bgError, setBgError] = useState(false);
  const [watchlistRefresh, setWatchlistRefresh] = useState(0);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('broken_video');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);


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
  }, [id, user, watchlistRefresh]);

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

  const trailerId = getYouTubeVideoId(movie?.trailerUrl) || getYouTubeVideoId(movie?.videoUrl);
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

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      
      {/* Header with trailer/thumbnail background */}
      <div className="relative">
        <img
          src={bgError ? getThumbnailUrl(null, 'hero', movie.title) : getThumbnailUrl(movie.thumbnail, 'hero', movie.title)}
          alt={movie.title}
          className="absolute inset-0 w-full h-[40vh] md:h-[60vh] object-cover"
          referrerPolicy="no-referrer"
          onError={() => setBgError(true)}
        />
        {trailerId && (
          <button
            onClick={() => setShowTrailer(true)}
            className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full transition-all"
          >
            <Play size={16} fill="white" />
            <span className="text-sm font-medium">Trailer</span>
          </button>
        )}
        <div className="absolute inset-0 h-[40vh] md:h-[60vh] bg-gradient-to-r from-netflix-bg via-netflix-bg/80 to-transparent"></div>
        <div className="absolute inset-0 h-[40vh] md:h-[60vh] bg-gradient-to-t from-netflix-bg via-transparent to-netflix-bg"></div>

        <div className="relative pt-[30vh] md:pt-[40vh] px-4 md:px-12 pb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-netflix-text-secondary hover:text-white mb-4 transition-colors">
            <ArrowLeft size={20} />
            Back
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Thumbnail */}
            <div className="w-full lg:w-80 flex-shrink-0 mx-auto lg:mx-0">
              <img 
                src={getThumbnailUrl(movie.thumbnail, 'detail', movie.title)} 
                alt={movie.title}
                className="w-full rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, 'detail', movie.title)}
              />
            </div>
            
            {/* Details */}
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4">{movie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-6 text-netflix-text-secondary text-sm md:text-base">
                {movie.ageRating && (
                  <span className="px-2 py-1 border border-white/50 rounded text-xs font-bold">
                    {movie.ageRating}
                  </span>
                )}
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
                   <a 
                     href={getYouTubeWatchUrl(trailerId)}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 bg-gray-700/70 text-white px-6 py-3 rounded font-semibold hover:bg-gray-600 transition-colors"
                   >
                     <Play size={24} />
                     Watch Trailer
                   </a>
                 )}

                {/* Add to Watchlist */}
                <button 
                  onClick={handleWatchlist} 
                  className="flex items-center justify-center gap-2 bg-netflix-bg-tertiary/70 text-white px-6 py-3 rounded font-semibold hover:bg-netflix-bg-tertiary transition-colors"
                >
                  {inWatchlist ? <Check size={24} /> : <Plus size={24} />}
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>

                {/* Report */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="flex items-center justify-center gap-2 bg-gray-800/70 text-gray-400 px-4 py-3 rounded font-semibold hover:text-white hover:bg-gray-700 transition-colors"
                >
                  <Flag size={20} />
                  Report
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
              <MovieCard key={m.id} movie={m} onWatchlist={watchlistIds} onWatchlistChange={() => setWatchlistRefresh(v => v + 1)} />
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}>
          <div className="bg-netflix-bg-secondary rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag size={20} className="text-netflix-warning" />
                Report Issue
              </h3>
              <button onClick={() => { setShowReportModal(false); setReportSubmitted(false); }} className="text-netflix-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                <p className="text-white text-lg font-semibold">Report Submitted</p>
                <p className="text-netflix-text-secondary mt-2">Thank you for helping us improve.</p>
                <button onClick={() => { setShowReportModal(false); setReportSubmitted(false); }} className="mt-6 px-6 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await adminService.submitReport({
                    type: reportType,
                    movieId: movie.id,
                    movieTitle: movie.title,
                    message: reportMessage
                  });
                  setReportSubmitted(true);
                  setReportMessage('');
                } catch (err) {
                  alert('Failed to submit report');
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm text-netflix-text-secondary mb-2">Issue Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-4 py-3 text-white focus:outline-none focus:border-netflix-red"
                  >
                    <option value="broken_video">Broken Video</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="missing_subtitles">Missing Subtitles</option>
                    <option value="broken_link">Broken Link</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-netflix-text-secondary mb-2">Description</label>
                  <textarea
                    value={reportMessage}
                    onChange={(e) => setReportMessage(e.target.value)}
                    className="w-full bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-4 py-3 text-white placeholder-netflix-text-muted focus:outline-none focus:border-netflix-red min-h-[100px]"
                    placeholder="Describe the issue..."
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded bg-netflix-bg-tertiary text-white hover:bg-gray-600 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-3 rounded bg-netflix-red text-white hover:bg-red-700 transition-colors">
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Trailer Modal - Fullscreen with Autoplay */}
      {showTrailer && trailerId && (
        <div 
          className="fixed inset-0 z-50 bg-black"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTrailer(false);
          }}
        >
          <button 
            onClick={() => setShowTrailer(false)} 
            className="absolute top-4 right-4 z-[60] text-white p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
          >
            <X size={32} />
          </button>
          <iframe
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            className="absolute top-0 left-0 w-full h-full"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={true}
            mozallowfullscreen="true"
            webkitallowfullscreen="true"
            title="Trailer"
          />
        </div>
      )}
    </div>
  );
};

export default MovieDetailsPage;

