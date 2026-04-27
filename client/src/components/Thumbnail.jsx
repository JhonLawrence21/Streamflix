import { useState } from 'react';

const DEFAULT_IMAGE = 'https://placehold.co/400x600/1a1a1a/ffffff?text=No+Image';
const PLACEHOLDER_IMAGE = 'https://placehold.co/400x600/1a1a1a/ffffff?text=Loading...';

const Thumbnail = ({ src, alt, className }) => {
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
        onLoad={handleLoad}
        onError={handleError}
        style={{ opacity: isLoading ? 0 : 1 }}
      />
    </div>
  );
};

export default Thumbnail;