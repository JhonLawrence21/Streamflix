import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { movieService } from '../services/api';
import { getYouTubeVideoId, getYouTubeWatchUrl, isDirectVideoUrl } from '../utils/imageUtils';

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
        setError(null);
        const data = await movieService.watchMovie(id);
        setMovie(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Movie not found');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

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

  const videoUrl = movie.videoUrl?.trim();
  const externalUrl = movie.externalUrl?.trim();
  const ytId = videoUrl ? getYouTubeVideoId(videoUrl) : null;

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
        {ytId && (
          <a
            href={getYouTubeWatchUrl(ytId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-netflix-red/80 hover:bg-netflix-red px-4 py-2 rounded"
          >
            <ExternalLink size={18} />
            Watch on YouTube
          </a>
        )}
      </div>

      <div className="relative h-screen bg-black flex items-center justify-center">
        {ytId ? (
          <div className="text-center text-white p-8">
            <Play size={64} className="text-netflix-text-secondary mb-4 mx-auto" />
            <p className="text-netflix-text-secondary text-lg mb-4">This video opens on YouTube</p>
            <a
              href={getYouTubeWatchUrl(ytId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-netflix-red text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              <ExternalLink size={24} />
              Watch on YouTube
            </a>
            <Link to={`/movie/${id}`} className="block text-netflix-text-secondary mt-4 hover:text-white">
              View Details
            </Link>
          </div>
        ) : videoUrl && isDirectVideoUrl(videoUrl) ? (
          <video
            src={videoUrl}
            controls
            className="w-full h-full object-contain"
            autoPlay
          />
        ) : externalUrl ? (
          <div className="text-center text-white p-8">
            <Play size={64} className="text-netflix-text-secondary mb-4 mx-auto" />
            <p className="text-netflix-text-secondary text-lg mb-4">This movie opens on an external site</p>
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-netflix-red text-white px-6 py-3 rounded font-semibold hover:bg-red-700 transition-colors"
            >
              <ExternalLink size={24} />
              Watch Now
            </a>
            <Link to={`/movie/${id}`} className="block text-netflix-text-secondary mt-4 hover:text-white">
              View Details
            </Link>
          </div>
        ) : (
          <div className="text-center text-white p-8">
            <Play size={64} className="text-netflix-text-secondary mb-4 mx-auto" />
            <p className="text-netflix-text-secondary text-lg">Video not available</p>
            <Link to={`/movie/${id}`} className="btn-primary mt-4 inline-block">
              View Details
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPage;
