import { useState } from 'react';

const FALLBACK = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="#1a1a2e" width="300" height="450"/><text x="150" y="225" text-anchor="middle" fill="#444" font-size="16" font-family="sans-serif">No Image</text></svg>');
const DEFAULT_IMAGE = FALLBACK;
const PLACEHOLDER_IMAGE = FALLBACK;

const Thumbnail = ({ src, alt, className, referrer = 'no-referrer' }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const handleSrc = () => {
    if (!src) return DEFAULT_IMAGE;
    if (imageError) return DEFAULT_IMAGE;
    return src;
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.log('Image failed to load:', src);
    setImageError(true);
    setIsLoading(false);
  };

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-netflix-bg-tertiary animate-pulse" />
      )}
      <img 
        src={handleSrc()}
        alt={alt || 'Movie thumbnail'}
        className={className}
        loading="lazy"
        referrerPolicy={referrer}
        onLoad={handleLoad}
        onError={handleError}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
};

export default Thumbnail;