import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Film, X } from 'lucide-react';
import { adminService } from '../../services/api';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formError, setFormError] = useState('');
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
    director: '',
    featured: false
  });

  useEffect(() => {
    fetchMovies();
  }, []);

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
      ...formData,
      genre: formData.genre.split(',').map(g => g.trim()).filter(g => g),
      cast: formData.cast.split(',').map(c => c.trim()).filter(c => c),
      rating: formData.rating ? parseFloat(formData.rating) : 0,
      releaseYear: formData.releaseYear ? parseInt(formData.releaseYear) : undefined,
      videoUrl: formData.videoUrl || undefined,
      externalUrl: formData.externalUrl || undefined,
      trailerUrl: formData.trailerUrl || undefined
    };

    console.log('[AdminMoviesPage] Submitting movie data:', JSON.stringify(movieData, null, 2));

    try {
      let response;
      if (editingMovie) {
        response = await adminService.updateMovie(editingMovie.id, movieData);
        console.log('[AdminMoviesPage] Update response:', response);
      } else {
        response = await adminService.createMovie(movieData);
        console.log('[AdminMoviesPage] Create response:', response);
      }

      setShowModal(false);
      setEditingMovie(null);
      resetForm();
      fetchMovies();
    } catch (error) {
      console.error('[AdminMoviesPage] Error saving movie:', error);
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
    console.log('[AdminMoviesPage] Editing movie:', movie);
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      videoUrl: movie.videoUrl || '',
      externalUrl: movie.externalUrl || '',
      trailerUrl: movie.trailerUrl || '',
      thumbnail: movie.thumbnail || '',
      category: movie.category || '',
      genre: parseGenre(movie.genre),
      cast: parseGenre(movie.cast),
      rating: movie.rating?.toString() || '',
      duration: movie.duration || '',
      releaseYear: movie.releaseYear?.toString() || '',
      director: movie.director || '',
      featured: !!movie.featured
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
      director: '',
      featured: false
    });
    setFormError('');
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

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-netflix-bg-tertiary rounded"></div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16">
          <Film size={48} className="mx-auto text-netflix-text-muted mb-4" />
          <p className="text-netflix-text-secondary">No movies yet. Add your first movie!</p>
        </div>
      ) : (
        <div className="bg-netflix-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-netflix-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Title</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Category</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Rating</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Views</th>
                  <th className="px-6 py-3 text-right text-netflix-text-secondary text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((movie) => (
                  <tr key={movie.id} className="border-t border-netflix-bg-tertiary">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={movie.thumbnail || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=100'} 
                          alt={movie.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div>
                          <p className="text-white font-medium">{movie.title}</p>
                          {movie.featured && (
                            <span className="text-xs text-netflix-red">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-netflix-text-secondary">{movie.category || 'N/A'}</td>
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
                  <label className="block text-netflix-text-secondary text-sm mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Action, Drama, Comedy"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Video URL (Embedded)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://youtube.com/embed/..."
                  />
                </div>
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">External Full Movie URL</label>
                  <input
                    type="url"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Trailer URL (YouTube)</label>
                <input
                  type="url"
                  value={formData.trailerUrl}
                  onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                  className="input-field"
                  placeholder="https://youtube.com/embed/..."
                />
              </div>

              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
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
                    placeholder="2h 15m"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-netflix-text-secondary text-sm mb-2">Genre (comma separated)</label>
                  <input
                    type="text"
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    className="input-field"
                    placeholder="Action, Adventure"
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
