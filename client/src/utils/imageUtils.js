const PLACEHOLDER_SVG = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="#1a1a2e" width="300" height="450"/><g transform="translate(150,225)"><rect x="-40" y="-30" width="80" height="60" rx="4" fill="none" stroke="#333" stroke-width="2"/><polygon points="-8,-15 20,0 -8,15" fill="#333"/><circle cx="-15" cy="-10" r="3" fill="#333"/><circle cx="-15" cy="10" r="3" fill="#333"/></g><text x="150" y="300" text-anchor="middle" fill="#444" font-size="14" font-family="sans-serif">No Image</text></svg>');
const DEFAULT_THUMBNAIL = PLACEHOLDER_SVG;
const DEFAULT_HERO_THUMBNAIL = '/icon-512.png';
const DEFAULT_DETAIL_THUMBNAIL = PLACEHOLDER_SVG;

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
 * Get thumbnail URL with fallback - simplified to avoid crashes
 */
export const getThumbnailUrl = (url, size = 'small') => {
  try {
    if (!url || typeof url !== 'string') {
      return size === 'hero' ? DEFAULT_HERO_THUMBNAIL : (size === 'detail' ? DEFAULT_DETAIL_THUMBNAIL : DEFAULT_THUMBNAIL);
    }
    const trimmed = url.trim();
    if (trimmed.length === 0) {
      return size === 'hero' ? DEFAULT_HERO_THUMBNAIL : (size === 'detail' ? DEFAULT_DETAIL_THUMBNAIL : DEFAULT_THUMBNAIL);
    }
    // Basic URL validation
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    return DEFAULT_THUMBNAIL;
  } catch (e) {
    return DEFAULT_THUMBNAIL;
  }
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
