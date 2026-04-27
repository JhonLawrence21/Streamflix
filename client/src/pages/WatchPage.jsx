import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { movieService } from '../services/api';
import { getYouTubeVideoId, getYouTubeEmbedUrl, isYouTubeUrl, isDirectVideoUrl } from '../utils/imageUtils';

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const data = await movieService.watchMovie(id);
        setMovie(data);
      } catch (err) {
        setError('Movie not found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovie();
  }, [id]);

  // Determine the best video source to display
  const getVideoSource = () => {
    if (!movie) return { type: 'none', src: null, href: null };

    const videoUrl = movie.videoUrl?.trim();
    const externalUrl = movie.externalUrl?.trim();

    // 1. Primary videoUrl
    if (videoUrl) {
      const ytId = getYouTubeVideoId(videoUrl);
      if (ytId) {
        return { type: 'youtube', src: ytId, href: null };
      }
      if (isDirectVideoUrl(videoUrl)) {
        return { type: 'direct', src: videoUrl, href: null };
      }
      // Unknown videoUrl type — treat as external link
      return { type: 'external', src: null, href: videoUrl };
    }

    // 2. Fallback to externalUrl
    if (externalUrl) {
      const ytId = getYouTubeVideoId(externalUrl);
      if (ytId) {
        return { type: 'youtube', src: ytId, href: null };
      }
      if (isDirectVideoUrl(externalUrl)) {
        return { type: 'direct', src: externalUrl, href: null };
      }
      // Non-YouTube, non-direct external URL
      return { type: 'external', src: null, href: externalUrl };
    }

    return { type: 'none', src: null, href: null };
  };

  const source = getVideoSource();

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen">
          <h1 className="text-2xl text-white mb-4">{error || 'Movie not found'}</h1>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/50 px-3 py-2 rounded"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        {source.type === 'external' && source.href && (
          <a
            href={source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-netflix-red/80 hover:bg-netflix-red px-4 py-2 rounded"
          >
            <ExternalLink size={18} />
            Watch Externally
          </a>
        )}
      </div>

      <div className="relative h-screen bg-black flex items-center justify-center">
        {source.type === 'youtube' && source.src ? (
          <iframe
            src={getYouTubeEmbedUrl(source.src, true)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={movie.title}
          />
        ) : source.type === 'direct' && source.src ? (
          <video
            src={source.src}
            controls
            className="w-full h-full object-contain"
            autoPlay
          />
        ) : source.type === 'external' && source.href ? (
          <div className="flex flex-col items-center justify-center">
            <Play size={64} className="text-netflix-text-secondary mb-4" />
            <p className="text-netflix-text-secondary text-lg mb-4">This movie opens on an external site</p>
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-netflix-red text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              <ExternalLink size={24} />
              Watch Now
            </a>
            <Link to={`/movie/${id}`} className="text-netflix-text-secondary mt-4 hover:text-white">
              View Details
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Play size={64} className="text-netflix-text-secondary mb-4" />
            <p className="text-netflix-text-secondary text-lg">Video not available</p>
            <Link to={`/movie/${id}`} className="btn-primary mt-4">
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;

