const encodeSvg = (svg) => {
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
};

const makePlaceholder = (title) => {
  const name = (title || 'No Image').substring(0, 2).toUpperCase();
  const safe = name.replace(/[&<>"]/g, '');
  const colors = ['#E50914', '#FFA500', '#4169E1', '#8B0000', '#00CED1', '#1C1C1C', '#FF69B4', '#32CD32', '#6A0DAD', '#008080'];
  const bg = colors[Math.abs((title || '').length || 0) % colors.length];
  return encodeSvg(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="${bg}" width="300" height="450"/><text x="150" y="225" text-anchor="middle" fill="white" font-size="64" font-weight="bold" font-family="sans-serif">${safe}</text></svg>`);
};

const DEFAULT_THUMBNAIL = makePlaceholder();
const DEFAULT_HERO_THUMBNAIL = makePlaceholder();
const DEFAULT_DETAIL_THUMBNAIL = makePlaceholder();

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
export const getThumbnailUrl = (url, size = 'small', title) => {
  try {
    if (!url || typeof url !== 'string' || !url.trim()) {
      return title ? makePlaceholder(title) : (size === 'hero' ? DEFAULT_HERO_THUMBNAIL : DEFAULT_THUMBNAIL);
    }
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      if (trimmed.includes('pinimg.com') || trimmed.includes('pinterest')) {
        return `/api/thumb?url=${encodeURIComponent(trimmed)}`;
      }
      return trimmed;
    }
    return title ? makePlaceholder(title) : DEFAULT_THUMBNAIL;
  } catch (e) {
    return DEFAULT_THUMBNAIL;
  }
};

export const handleImageError = (event, size = 'small', title) => {
  if (event && event.target) {
    event.target.src = getThumbnailUrl(null, size, title || event.target.alt || '');
    event.target.style.backgroundColor = '#1C1C1C';
  }
};

/**
 * Check if a URL is a direct video file link
 */
export const isDirectVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|mov|avi|mkv)$/i.test(url);
};
