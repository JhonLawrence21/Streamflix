import React from 'react';

const MovieRow = ({ title, movies = [] }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="py-8 px-4 md:px-12">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="flex justify-center py-16">
          <p className="text-lg text-gray-400">No {title.toLowerCase()} movies available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 md:px-12">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>
        {movies.slice(0, 10).map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-32 sm:w-40 md:w-48 bg-[#2a2a2a] rounded hover:bg-gray-800 p-2 cursor-pointer">
            <img 
              src={movie.thumbnail || 'https://via.placeholder.com/200x300/333/fff?text=Movie'} 
              alt={movie.title}
              className="w-full h-64 object-cover rounded mb-2"
              onError={(e) => e.target.src = 'https://via.placeholder.com/200x300/333/fff?text=Movie'}
            />
            <p className="text-sm truncate text-white font-medium">{movie.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieRow;

