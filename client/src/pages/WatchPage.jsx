import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Volume1, SkipForward, Settings, Maximize, Minimize, Flag, CheckCircle, X, ChevronLeft, Subtitles } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { movieService, adminService, recommendationService } from '../services/api';

const QUALITY_LABELS = { '480': '480p', '720': '720p HD', '1080': '1080p Full HD' };
const QUALITY_ORDER = ['1080', '720', '480'];

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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [skipIntro, setSkipIntro] = useState(false);
  const [skipCountdown, setSkipCountdown] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState('broken_video');
  const [reportMessage, setReportMessage] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showTitle, setShowTitle] = useState(true);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressRef = useRef(null);
  const settingsRef = useRef(null);

  const introDuration = 90;

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        setVideoError(false);
        const data = await movieService.watchMovie(id);
        setMovie(data);
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

  const getVideoSources = useCallback(() => {
    if (!movie) return [];
    const sources = [];
    let videoSources = {};
    if (movie.videoSources) {
      try {
        videoSources = typeof movie.videoSources === 'string' ? JSON.parse(movie.videoSources) : movie.videoSources;
      } catch { videoSources = {}; }
    }
    for (const q of QUALITY_ORDER) {
      if (videoSources[q] && videoSources[q].trim()) {
        sources.push({ quality: q, label: QUALITY_LABELS[q], url: videoSources[q].trim() });
      }
    }
    if (movie.videoUrl && movie.videoUrl.trim()) {
      const hasExisting = sources.some(s => s.url === movie.videoUrl.trim());
      if (!hasExisting) {
        sources.push({ quality: 'default', label: 'Default', url: movie.videoUrl.trim() });
      }
    }
    return sources;
  }, [movie]);

  const sources = getVideoSources();
  const currentSource = sources.find(s => s.quality === quality) || sources.find(s => s.quality === '720') || sources.find(s => s.quality === '1080') || sources[0];

  useEffect(() => {
    if (sources.length > 0 && quality === 'auto') {
      const preferred = sources.find(s => s.quality === '1080') || sources.find(s => s.quality === '720') || sources[0];
      setQuality(preferred.quality);
    }
  }, [sources, quality]);

  useEffect(() => {
    if (videoRef.current && currentSource) {
      const wasPlaying = !videoRef.current.paused;
      const lastTime = videoRef.current.currentTime;
      videoRef.current.src = currentSource.url;
      videoRef.current.load();
      videoRef.current.currentTime = lastTime;
      if (wasPlaying) videoRef.current.play().catch(() => {});
    }
  }, [currentSource?.url]);

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
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [skipIntro, skipCountdown]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    setShowTitle(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
        setShowTitle(false);
        setShowSettings(false);
      }
    }, 3000);
  }, []);

  const handleMouseMove = resetControlsTimeout;

  const handlePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.buffered.length > 0) {
      setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }
    if (videoRef.current.currentTime > introDuration && skipIntro) {
      setSkipIntro(false);
      setSkipCountdown(null);
    }
  };

  const handleProgressClick = (e) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val === 0) setIsMuted(true);
    else setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) setVolume(0.5);
    } else {
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement?.parentElement;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = introDuration;
    }
    setSkipIntro(false);
    setSkipCountdown(null);
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
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

  if (sources.length === 0) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen text-center px-4">
          <Play size={64} className="text-netflix-text-secondary mb-4 mx-auto" />
          <h1 className="text-2xl text-white mb-2">{movie.title}</h1>
          <p className="text-netflix-text-secondary text-lg mb-6">No video sources available for this movie.</p>
          <Link to={`/movie/${id}`} className="btn-primary">View Details</Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black z-50"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { if (videoRef.current && !videoRef.current.paused) { setShowControls(false); setShowTitle(false); } }}
    >
      {/* Video */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={currentSource?.url}
          className="w-full h-full object-contain"
          autoPlay
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={(e) => setDuration(e.target.duration)}
          onPlay={() => { setIsPlaying(true); setIsBuffering(false); }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onCanPlay={() => setIsBuffering(false)}
          onClick={handlePlay}
          onDoubleClick={toggleFullscreen}
          onError={() => setVideoError(true)}
          playsInline
        />
      </div>

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white/80"></div>
        </div>
      )}

      {/* Top bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft size={28} />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-lg md:text-xl font-semibold">{movie.title}</h1>
            {movie.releaseYear && <span className="text-white/50 text-sm">{movie.releaseYear}</span>}
          </div>
          <Link
            to={`/movie/${id}`}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Details
          </Link>
        </div>
      </div>

      {/* Center play button (when paused) */}
      {!isPlaying && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <button
            onClick={handlePlay}
            className="pointer-events-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
          >
            <Play size={40} className="text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      {/* Skip Intro button */}
      {skipIntro && skipCountdown !== null && currentTime < introDuration && (
        <button
          onClick={handleSkipIntro}
          className="absolute bottom-28 right-8 z-30 bg-white text-black px-6 py-3 rounded font-semibold hover:bg-white/90 transition-all text-sm"
        >
          Skip Intro
        </button>
      )}

      {/* Bottom controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Progress bar */}
        <div className="px-4 md:px-8 pt-6">
          <div
            ref={progressRef}
            className="relative h-1 bg-white/20 rounded-full cursor-pointer group hover:h-1.5 transition-all"
            onClick={handleProgressClick}
          >
            {/* Buffered */}
            <div
              className="absolute top-0 left-0 h-full bg-white/20 rounded-full"
              style={{ width: `${duration ? (buffered / duration) * 100 : 0}%` }}
            />
            {/* Progress */}
            <div
              className="absolute top-0 left-0 h-full bg-netflix-red rounded-full"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            {/* Hover thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-netflix-red rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%`, transform: `translate(-50%, -50%)` }}
            />
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between px-4 md:px-8 py-3">
          <div className="flex items-center gap-2 md:gap-3">
            {/* Play/Pause */}
            <button onClick={handlePlay} className="p-2 hover:bg-white/10 rounded transition-colors">
              {isPlaying ? (
                <Pause size={24} className="text-white" fill="white" />
              ) : (
                <Play size={24} className="text-white" fill="white" />
              )}
            </button>

            {/* Skip */}
            <button
              onClick={handleSkipIntro}
              className="p-2 hover:bg-white/10 rounded transition-colors hidden md:block"
              title="Skip Intro"
            >
              <SkipForward size={22} className="text-white" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/vol">
              <button onClick={toggleMute} className="p-2 hover:bg-white/10 rounded transition-colors">
                {isMuted || volume === 0 ? (
                  <VolumeX size={22} className="text-white" />
                ) : volume < 0.5 ? (
                  <Volume1 size={22} className="text-white" />
                ) : (
                  <Volume2 size={22} className="text-white" />
                )}
              </button>
              <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-200">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 accent-white cursor-pointer"
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-white/70 text-xs md:text-sm ml-1 hidden sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Autoplay toggle */}
            <button
              onClick={() => setAutoplay(!autoplay)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors hidden md:block ${
                autoplay ? 'bg-netflix-red text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              Autoplay
            </button>

            {/* Quality selector */}
            {sources.length > 1 && (
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 hover:bg-white/10 rounded transition-colors flex items-center gap-1"
                  title="Settings"
                >
                  <Settings size={20} className="text-white" />
                  <span className="text-xs text-white/70 hidden md:inline">
                    {quality === 'auto' ? 'Auto' : QUALITY_LABELS[quality] || quality}
                  </span>
                </button>
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm rounded-lg overflow-hidden min-w-[160px] border border-white/10 shadow-xl">
                    <div className="px-4 py-2 border-b border-white/10">
                      <span className="text-xs text-white/50 uppercase tracking-wider">Quality</span>
                    </div>
                    {sources.map(src => (
                      <button
                        key={src.quality}
                        onClick={() => { setQuality(src.quality); setShowSettings(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${
                          quality === src.quality ? 'text-netflix-red' : 'text-white'
                        }`}
                      >
                        <span>{src.label}</span>
                        {quality === src.quality && <span className="text-netflix-red text-xs">●</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Report */}
            <button
              onClick={() => setShowReportModal(true)}
              className="p-2 hover:bg-white/10 rounded transition-colors hidden md:block"
              title="Report"
            >
              <Flag size={18} className="text-white/60" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded transition-colors">
              {isFullscreen ? (
                <Minimize size={22} className="text-white" />
              ) : (
                <Maximize size={22} className="text-white" />
              )}
            </button>
          </div>
        </div>
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
                <button onClick={() => { setShowReportModal(false); setReportSubmitted(false); }} className="mt-6 px-6 py-2 bg-netflix-red text-white rounded hover:bg-red-700 transition-colors">Close</button>
              </div>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await adminService.submitReport({ type: reportType, movieId: movie.id, movieTitle: movie.title, message: reportMessage });
                  setReportSubmitted(true);
                  setReportMessage('');
                } catch (err) {
                  alert('Failed to submit report');
                }
              }}>
                <div className="mb-4">
                  <label className="block text-sm text-netflix-text-secondary mb-2">Issue Type</label>
                  <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-4 py-3 text-white focus:outline-none focus:border-netflix-red">
                    <option value="broken_video">Broken Video</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="missing_subtitles">Missing Subtitles</option>
                    <option value="broken_link">Broken Link</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-netflix-text-secondary mb-2">Description</label>
                  <textarea value={reportMessage} onChange={(e) => setReportMessage(e.target.value)} className="w-full bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-4 py-3 text-white placeholder-netflix-text-muted focus:outline-none focus:border-netflix-red min-h-[100px]" placeholder="Describe the issue..." required />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowReportModal(false)} className="flex-1 py-3 rounded bg-netflix-bg-tertiary text-white hover:bg-gray-600 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded bg-netflix-red text-white hover:bg-red-700 transition-colors">Submit Report</button>
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
