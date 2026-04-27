import { useState } from 'react';
import { getProxyImageUrl } from '../utils/imageUtils';

const Thumbnail = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false);
  
  const defaultSrc = 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400';
  const fallbackSrc = 'https://via.placeholder.com/400x600?text=No+Image';

  const handleSrc = () => {
    if (!src || imageError) return fallbackSrc;
    if (src.includes('unsplash.com') || src.includes('placeholder.com') || src.includes('corsproxy')) {
      return src;
    }
    return getProxyImageUrl(src);
  };

  return (
    <img 
      src={handleSrc()}
      alt={alt || 'Movie thumbnail'}
      className={className}
      loading="lazy"
      onError={() => setImageError(true)}
    />
  );
};

export default Thumbnail;