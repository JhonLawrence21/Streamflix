import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-netflix-bg">
      {/* Navbar skeleton */}
      <div className="h-16 bg-netflix-bg-tertiary mx-4 md:mx-12 rounded mt-4 animate-pulse"></div>
      
      {/* Hero banner skeleton */}
      <div className="h-[85vh] bg-gradient-to-br from-netflix-bg-tertiary/50 to-netflix-bg animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/50"></div>
        <div className="h-full flex items-center px-4 md:px-12">
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="h-12 w-80 bg-netflix-bg-tertiary rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-netflix-bg-secondary rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-netflix-bg-secondary rounded animate-pulse"></div>
            <div className="h-40 w-full bg-netflix-bg-tertiary rounded animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-12 w-28 bg-white/20 rounded animate-pulse"></div>
              <div className="h-12 w-32 bg-netflix-bg-secondary/70 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Row skeletons */}
      <div className="px-4 md:px-12 py-8 space-y-8">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-64 bg-netflix-bg-tertiary rounded animate-pulse"></div>
            <div className="flex gap-3 overflow-hidden">
              {[1,2,3,4,5].map((j) => (
                <div key={j} className="flex-shrink-0 w-32 sm:w-36 md:w-40 h-48 bg-netflix-bg-tertiary rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;

