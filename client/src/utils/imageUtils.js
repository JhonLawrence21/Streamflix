const DEFAULT_THUMBNAIL = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400';
const DEFAULT_HERO_THUMBNAIL = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920';
const DEFAULT_DETAIL_THUMBNAIL = 'https://placehold.co/400x600/1a1a1a/ffffff?text=No+Image';

/**
 * Extract YouTube video ID from various YouTube URL formats
 */
export const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
};

/**
 * Get YouTube watch URL from video ID
 */
export const getYouTubeWatchUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Check if a URL is a YouTube URL
 */
export const isYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return url.includes('youtube') || url.includes('youtu.be');
};

/**
 * Get YouTube embed URL from video ID
 */
export const getYouTubeEmbedUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`;
};

/**
 * Get thumbnail URL with fallback
 */
export const getThumbnailUrl = (url, size = 'small') => {
  if (url && typeof url === 'string' && url.trim().length > 0) {
    return url.trim();
  }
  if (size === 'hero') return DEFAULT_HERO_THUMBNAIL;
  if (size === 'detail') return DEFAULT_DETAIL_THUMBNAIL;
  return DEFAULT_THUMBNAIL;
};

/**
 * Handle image load error by setting fallback src
 */
export const handleImageError = (event, size = 'small') => {
  if (event && event.target) {
    event.target.src = getThumbnailUrl(null, size);
  }
};

/**
 * Check if a URL is a direct video file link
 */
export const isDirectVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
};
