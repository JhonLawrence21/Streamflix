import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { movieService } from '../services/api';

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const viewedKey = `viewed_${id}`;
    const hasViewed = localStorage.getItem(viewedKey);
    
    const fetchMovie = async () => {
      try {
        setLoading(true);
        if (!hasViewed) {
          const data = await movieService.watchMovie(id);
          localStorage.setItem(viewedKey, 'true');
          setMovie(data);
        } else {
          const data = await movieService.getById(id);
          setMovie(data);
        }
      } catch (err) {
        setError('Movie not found');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovie();
  }, [id]);

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

  const getVideoUrl = () => {
    if (movie.videoUrl && movie.videoUrl.trim()) {
      const ytId = getYouTubeVideoId(movie.videoUrl);
      if (ytId) return ytId;
      return movie.videoUrl;
    }
    if (movie.externalUrl && movie.externalUrl.trim()) {
      const ytId = getYouTubeVideoId(movie.externalUrl);
      if (ytId) return ytId;
      return movie.externalUrl;
    }
    return null;
  };

  const isYouTube = (url) => {
    return url && (url.includes('youtube') || url.includes('youtu.be'));
  };

  const videoSrc = getVideoUrl();
  const isYT = videoSrc && isYouTube(movie.videoUrl || movie.externalUrl);

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

  const youtubeId = getYouTubeVideoId(movie.videoUrl);
  const hasExternalUrl = movie?.externalUrl && movie.externalUrl.trim() !== '';
  const externalUrlId = hasExternalUrl ? getYouTubeVideoId(movie.externalUrl) : null;

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
        {hasExternalUrl && (
          <a
            href={movie.externalUrl}
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
        {isYT ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoSrc}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={movie.title}
          />
        ) : videoSrc ? (
          <video
            src={videoSrc}
            controls
            className="w-full h-full object-contain"
            autoPlay
          />
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