import { useState, useEffect } from 'react';
import { Download, Trash2, Play, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const DownloadsPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'GET_CACHED_VIDEOS' });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'CACHED_VIDEOS_LIST') {
          setVideos(event.data.videos);
          setLoading(false);
        }
        if (event.data.type === 'DOWNLOAD_COMPLETE') {
          setVideos(prev => [...prev, { movieId: event.data.movieId }]);
        }
        if (event.data.type === 'DOWNLOAD_ERROR') {
          alert(`Download failed: ${event.data.error}`);
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleDelete = (movieId) => {
    if (!window.confirm('Delete this download?')) return;

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'DELETE_VIDEO',
        movieId
      });
      setVideos(videos.filter(v => v.movieId !== movieId));
    }
  };

  const handlePlay = (movieId) => {
    window.location.href = `/watch/${movieId}`;
  };

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <div className="pt-24 px-4 md:px-12 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Downloads
          </h1>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isOnline ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
          }`}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-sm font-medium">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {!isOnline && (
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-blue-400 flex-shrink-0" />
            <p className="text-blue-200 text-sm">
              You're offline. Downloaded videos can still be played.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <Download size={64} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl text-white mb-2">No Downloads Yet</h2>
            <p className="text-netflix-text-secondary max-w-md mx-auto">
              Download movies and shows to watch offline. Look for the download button on movie details pages.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => (
              <div
                key={video.movieId}
                className="bg-netflix-bg-secondary rounded-lg overflow-hidden hover:bg-netflix-bg-tertiary transition-colors"
              >
                <div className="aspect-video bg-black relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={48} className="text-gray-600" />
                  </div>
                  <button
                    onClick={() => handlePlay(video.movieId)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <Play size={32} className="text-black ml-1" />
                    </div>
                  </button>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Movie #{video.movieId}</p>
                    <p className="text-netflix-text-secondary text-sm">Downloaded</p>
                  </div>
                  <button
                    onClick={() => handleDelete(video.movieId)}
                    className="p-2 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DownloadsPage;