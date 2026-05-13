import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ExternalLink, Volume2, VolumeX, SkipForward, Settings, Maximize, Minimize, Flag, CheckCircle, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { movieService, adminService, recommendationService } from '../services/api';
import { isDirectVideoUrl } from '../utils/imageUtils';

const WatchPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);
  const [introDuration] = useState(10);
  const [skipCountdown, setSkipCountdown] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('broken_video');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        setVideoError(false);
        const data = await movieService.watchMovie(id);
        setMovie(data);

        // Track watch in viewing history
        const token = localStorage.getItem('token');
        if (token) {
          recommendationService.trackWatch(id, { duration: 0, completed: false }).catch(() => {});
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Movie not found');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    let interval;
    if (skipIntro && skipCountdown !== null && skipCountdown > 0) {
      interval = setInterval(() => {
        setSkipCountdown(prev => {
          if (prev <= 1) {
            setSkipIntro(false);
            setSkipCountdown(null);
            if (videoRef.current) {
              videoRef.current.currentTime = introDuration;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [skipIntro, skipCountdown, introDuration]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handlePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = introDuration;
    }
    setSkipIntro(false);
    setSkipCountdown(null);
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && skipIntro && videoRef.current.currentTime < introDuration && !skipCountdown) {
      setSkipCountdown(introDuration - Math.floor(videoRef.current.currentTime));
    }
  };

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
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const ytId = videoUrl ? getYouTubeVideoId(videoUrl) : null;

  return (
    <div className="min-h-screen bg-black">
      <div
        className={`fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/50 px-3 py-2 rounded"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleMute}
            className="p-2 rounded bg-black/50 hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded bg-black/50 hover:bg-black/70 transition-colors"
          >
            {isFullscreen ? <Minimize size={20} className="text-white" /> : <Maximize size={20} className="text-white" />}
          </button>
          <div className="flex items-center gap-2 bg-black/50 rounded px-3 py-1">
            <span className="text-xs text-white">Autoplay</span>
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={`w-8 h-4 rounded-full transition-colors ${autoplay ? 'bg-netflix-red' : 'bg-gray-600'}`}
            >
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${autoplay ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </button>
          </div>
          {ytId && (
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-netflix-red/80 hover:bg-netflix-red px-4 py-2 rounded"
            >
              <ExternalLink size={18} />
              YouTube
            </a>
          )}
          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/50 hover:bg-black/70 px-3 py-2 rounded"
          >
            <Flag size={16} />
            Report
          </button>
        </div>
      </div>

      <div
        className="relative h-screen bg-black flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {ytId ? (
          <div className="text-center text-white p-8">
            <Play size={64} className="text-netflix-text-secondary mb-4 mx-auto" />
            <p className="text-netflix-text-secondary text-lg mb-4">This video opens on YouTube</p>
            <a
              href={`https://www.youtube.com/watch?v=${ytId}`}
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
        ) : videoUrl && isDirectVideoUrl(videoUrl) && !videoError ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              controls={false}
              className="w-full h-full object-contain"
              autoPlay={autoplay}
              muted={isMuted}
              onTimeUpdate={handleVideoTimeUpdate}
              onClick={handlePlay}
              onError={() => setVideoError(true)}
            />

            {skipIntro && skipCountdown !== null && videoRef.current && videoRef.current.currentTime < introDuration && (
              <button
                onClick={handleSkipIntro}
                className="absolute bottom-20 right-8 bg-black/80 text-white px-4 py-2 rounded border border-white/30 hover:bg-black/90 transition-colors"
              >
                Skip Intro ({skipCountdown}s)
              </button>
            )}

            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePlay}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                >
                  <Play size={24} className="text-white" />
                </button>
                <button
                  onClick={handleSkipIntro}
                  className="p-2 hover:bg-white/20 rounded transition-colors"
                  disabled={!skipIntro}
                >
                  <SkipForward size={24} className={`text-white ${!skipIntro ? 'opacity-50' : ''}`} />
                </button>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="0"
                    className="w-full h-1 bg-gray-600 rounded appearance-none cursor-pointer accent-netflix-red"
                  />
                </div>
                <button onClick={toggleMute} className="p-2 hover:bg-white/20 rounded transition-colors">
                  {isMuted ? <VolumeX size={20} className="text-white" /> : <Volume2 size={20} className="text-white" />}
                </button>
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded transition-colors">
                  {isFullscreen ? <Minimize size={20} className="text-white" /> : <Maximize size={20} className="text-white" />}
                </button>
              </div>
            </div>
          </>
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
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}>
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
    </div>
  );
};

export default WatchPage;