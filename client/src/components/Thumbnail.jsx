import { useState } from 'react';

const Thumbnail = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleSrc = () => {
    if (!src || imageError) {
      return 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400';
    }
    return src;
  };

  return (
    <img 
      src={handleSrc()}
      alt={alt || 'Movie thumbnail'}
      className={className}
      loading="lazy"
      onError={() => {
        console.log('Image failed to load:', src);
        setImageError(true);
      }}
    />
  );
};

export default Thumbnail;