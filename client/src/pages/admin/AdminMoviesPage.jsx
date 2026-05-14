import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Film, X, Search, Filter, CheckSquare, Square, Trash } from 'lucide-react';
import { adminService } from '../../services/api';
import { getThumbnailUrl, handleImageError } from '../../utils/imageUtils';
import { COUNTRIES } from '../../utils/filterOptions';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    externalUrl: '',
    trailerUrl: '',
    thumbnail: '',
    category: '',
    genre: '',
    cast: '',
    rating: '',
    duration: '',
    releaseYear: '',
    releaseDate: '',
    status: 'released',
    director: '',
    featured: false,
    trending: false,
    type: 'movie',
    country: ''
  });

  useEffect(() => {
    fetchMovies();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const cats = await adminService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    filterMovies();
  }, [searchQuery, statusFilter, categoryFilter, movies]);

  const filterMovies = () => {
    let filtered = [...movies];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(movie => 
        movie.title?.toLowerCase().includes(query) ||
        movie.director?.toLowerCase().includes(query) ||
        movie.category?.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(movie => movie.status === statusFilter);
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(movie => movie.category === categoryFilter);
    }
    
    setFilteredMovies(filtered);
  };

  const toggleSelectMovie = (movieId) => {
    setSelectedMovies(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedMovies.length === filteredMovies.length) {
      setSelectedMovies([]);
    } else {
      setSelectedMovies(filteredMovies.map(m => m.id));
    }
    setShowBulkActions(true);
  };

  const bulkDelete = async () => {
    if (window.confirm(`Delete ${selectedMovies.length} selected movies?`)) {
      try {
        await Promise.all(selectedMovies.map(id => adminService.deleteMovie(id)));
        setSelectedMovies([]);
        setShowBulkActions(false);
        fetchMovies();
      } catch (error) {
        console.error('Error bulk deleting movies:', error);
      }
    }
  };

  const fetchMovies = async () => {
    try {
      const data = await adminService.getMovies();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const movieData = {
      title: formData.title,
      description: formData.description || '',
      thumbnail: formData.thumbnail || '',
      videoUrl: formData.videoUrl || '',
      externalUrl: formData.externalUrl || '',
      trailerUrl: formData.trailerUrl || '',
      category: formData.category || '',
      type: formData.type || 'movie',
      country: formData.country || '',
      director: formData.director || '',
      duration: formData.duration || '',
      genre: formData.genre ? formData.genre.split(',').map(g => g.trim()).filter(g => g) : [],
      cast: formData.cast ? formData.cast.split(',').map(c => c.trim()).filter(c => c) : [],
      rating: formData.rating ? parseFloat(formData.rating) : 0,
      releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : null,
      releaseDate: formData.releaseDate || null,
      status: formData.status || 'released',
      featured: formData.featured,
      trending: formData.trending
    };

    try {
      if (editingMovie) {
        await adminService.updateMovie(editingMovie.id, movieData);
      } else {
        await adminService.createMovie(movieData);
      }
      setShowModal(false);
      setEditingMovie(null);
      resetForm();
      fetchMovies();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Failed to save movie';
      setFormError(msg);
    }
  };

  const parseGenre = (value) => {
    if (!value) return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.join(', ');
        if (typeof parsed === 'string') return parsed;
      } catch {}
      if (value.includes(',')) return value;
      return value;
    }
    return '';
  };

  const handleEdit = (movie) => {
    console.log('[handleEdit] movie.trending:', movie.trending, 'typeof:', typeof movie.trending);
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      videoUrl: movie.videoUrl || '',
      externalUrl: movie.externalUrl || '',
      trailerUrl: movie.trailerUrl || '',
      thumbnail: movie.thumbnail || '',
      category: movie.category || '',
      type: movie.type || 'movie',
      country: movie.country || '',
      genre: parseGenre(movie.genre),
      cast: parseGenre(movie.cast),
      rating: movie.rating?.toString() || '',
      duration: movie.duration || '',
      releaseYear: movie.releaseYear?.toString() || '',
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      director: movie.director || '',
      status: movie.status || 'released',
      featured: !!movie.featured,
      trending: !!movie.trending
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await adminService.deleteMovie(id);
        fetchMovies();
      } catch (error) {
        console.error('Error deleting movie:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      externalUrl: '',
      trailerUrl: '',
      thumbnail: '',
      category: '',
      genre: '',
      cast: '',
      rating: '',
      duration: '',
      releaseYear: '',
      releaseDate: '',
      director: '',
      status: 'released',
      featured: false,
      trending: false,
      type: 'movie',
      country: ''
    });
    setFormError('');
  };

  const renderGenreTags = (genreValue) => {
    const genreList = parseGenre(genreValue);
    if (!genreList) return <span className="text-netflix-text-muted text-sm">—</span>;
    return genreList.split(',').slice(0, 3).map((g, i) => (
      <span key={i} className="text-xs px-2 py-0.5 bg-netflix-bg-tertiary text-netflix-text-secondary rounded-full">
        {g.trim()}
      </span>
    ));
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Movies</h1>
        <button
          onClick={() => { resetForm(); setEditingMovie(null); setShowModal(true); }}
          className="flex items-center gap-2 btn-primary"
        >
          <Plus size={20} />
          Add Movie
        </button>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
          <input
            type="text"
            placeholder="Search movies by title, director, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-netflix-bg-tertiary border border-transparent rounded-lg text-white placeholder-netflix-text-muted focus:outline-none focus:border-netflix-red transition-colors"
          />
        </div>
        
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-netflix-bg-tertiary rounded-lg text-white border border-transparent focus:outline-none focus:border-netflix-red cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="released">Released</option>
            <option value="upcoming">Upcoming</option>
            <option value="in-production">In Production</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-netflix-bg-tertiary rounded-lg text-white border border-transparent focus:outline-none focus:border-netflix-red cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {showBulkActions && selectedMovies.length > 0 && (
        <div className="mb-4 p-4 bg-netflix-bg-tertiary rounded-lg flex items-center justify-between">
          <span className="text-white">{selectedMovies.length} movie(s) selected</span>
          <div className="flex gap-2">
            <button
              onClick={bulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash size={16} />
              Delete Selected
            </button>
            <button
              onClick={() => { setSelectedMovies([]); setShowBulkActions(false); }}
              className="px-4 py-2 bg-netflix-bg-secondary hover:bg-netflix-bg-tertiary text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-netflix-bg-tertiary rounded"></div>
          ))}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-16">
          <Film size={48} className="mx-auto text-netflix-text-muted mb-4" />
          <p className="text-netflix-text-secondary">
            {movies.length === 0 ? 'No movies yet. Add your first movie!' : 'No movies match your filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-netflix-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-netflix-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button onClick={toggleSelectAll} className="text-netflix-text-secondary hover:text-white">
                      {selectedMovies.length === filteredMovies.length && filteredMovies.length > 0 ? (
                        <CheckSquare size={18} />
                      ) : (
                        <Square size={18} />
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Title</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Category</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Genre</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Status</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Rating</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Views</th>
                  <th className="px-6 py-3 text-right text-netflix-text-secondary text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className={`border-t border-netflix-bg-tertiary ${selectedMovies.includes(movie.id) ? 'bg-netflix-bg-tertiary/50' : ''}`}>
                    <td className="px-6 py-4">
                      <button onClick={() => toggleSelectMovie(movie.id)} className="text-netflix-text-secondary hover:text-white">
                        {selectedMovies.includes(movie.id) ? (
                          <CheckSquare size={18} className="text-netflix-red" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
<img
                           src={getThumbnailUrl(movie.thumbnail, 'small', movie.title)}
                           alt={movie.title}
                           className="w-12 h-12 object-cover rounded"
                           referrerPolicy="no-referrer"
                           onError={(e) => handleImageError(e, 'small', movie.title)}
                         />
                        <div>
                          <p className="text-white font-medium">{movie.title}</p>
                          <div className="flex gap-1 flex-wrap">
                            {movie.featured && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-900/50 text-red-200 rounded">Featured</span>
                            )}
                            {movie.trending && (
                              <span className="text-xs px-1.5 py-0.5 bg-amber-900/50 text-amber-200 rounded">Trending</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-netflix-text-secondary">{movie.category || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {renderGenreTags(movie.genre)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        movie.status === 'released' ? 'bg-green-900/50 text-green-200' :
                        movie.status === 'upcoming' ? 'bg-blue-900/50 text-blue-200' :
                        'bg-gray-900/50 text-gray-200'
                      }`}>
                        {movie.status || 'released'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-netflix-success">{movie.rating?.toFixed(1) || 'N/A'}</td>
                    <td className="px-6 py-4 text-netflix-text-secondary">{movie.views || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(movie)}
                        className="text-netflix-text-secondary hover:text-white p-2"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(movie.id)}
                        className="text-netflix-text-secondary hover:text-netflix-red p-2 ml-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-netflix-bg-secondary rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-netflix-bg-tertiary">
              <h2 className="text-xl font-bold text-white">
                {editingMovie ? 'Edit Movie' : 'Add Movie'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-netflix-text-secondary">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="movie">Movie</option>
                    <option value="tv">TV Show</option>
                  </select>
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Action, Drama, Comedy, TV Shows"
                  />
                </div>
              </div>

              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Video URL</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">External URL</label>
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Trailer URL</label>
                  <input
                    type="url"
                    value={formData.trailerUrl}
                    onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Thumbnail URL</label>
                <input
                  type="text"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
                {formData.thumbnail && (
                  <div className="mt-2">
<img
                       src={getThumbnailUrl(formData.thumbnail, 'detail', 'Preview')}
                       alt="Thumbnail preview"
                       className="w-24 h-36 object-cover rounded border border-netflix-bg-tertiary"
                       referrerPolicy="no-referrer"
                       onError={(e) => { e.target.src = getThumbnailUrl(null, 'detail', 'Preview'); }}
                     />
                    <p className="text-xs text-netflix-text-muted mt-1">Preview</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Rating (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="2h 15m or 8 Episodes"
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Release Year</label>
                  <input
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Release Date</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="released">Released</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="in-production">In Production</option>
                  </select>
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Genre (comma separated)</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="input-field"
                    placeholder="Action, Adventure, Mystery"
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Cast (comma separated)</label>
                  <input
                    type="text"
                    value={formData.cast}
                    onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                    className="input-field"
                    placeholder="Actor One, Actor Two"
                  />
                </div>
              </div>

              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Director</label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-white">Feature on homepage</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="trending"
                    checked={formData.trending}
                    onChange={(e) => {
                      console.log('[trending] onChange fired, e.target.checked:', e.target.checked, 'prev formData.trending:', formData.trending);
                      const val = e.target.checked;
                      setFormData(prev => ({ ...prev, trending: val }));
                    }}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="trending" className="text-white cursor-pointer select-none">Show in Trending Now</label>
                </div>
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                {editingMovie ? 'Update Movie' : 'Add Movie'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMoviesPage;