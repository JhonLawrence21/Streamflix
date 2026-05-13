import { useState, useEffect } from 'react';
import { Users, User, Crown, Edit, Trash2, X, Eye, Heart, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { adminService } from '../../services/api';
import { getThumbnailUrl, handleImageError } from '../../utils/imageUtils';

const UserActivityCard = ({ user, onViewActivity }) => (
  <div className="bg-netflix-bg-tertiary rounded-lg p-4 hover:bg-netflix-bg-tertiary/80 transition-colors">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-netflix-red flex items-center justify-center">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={20} className="text-white" />
          )}
        </div>
        <div>
          <p className="text-white font-medium">{user.name}</p>
          <p className="text-netflix-text-muted text-sm">{user.email}</p>
        </div>
      </div>
      <button
        onClick={() => onViewActivity(user)}
        className="flex items-center gap-2 px-3 py-2 bg-netflix-bg-secondary hover:bg-netflix-bg-tertiary text-white rounded-lg transition-colors"
      >
        <Eye size={16} />
        View Activity
      </button>
    </div>
  </div>
);

const UserDetailModal = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [watchlist, setWatchlist] = useState([]);
  const [viewHistory, setViewHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const [watchlistData, historyData] = await Promise.all([
          adminService.getUserWatchlist(user.id),
          adminService.getUserViewHistory(user.id)
        ]);
        setWatchlist(watchlistData || []);
        setViewHistory(historyData || []);
      } catch (error) {
        console.error('Error fetching user activity:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-netflix-bg-secondary rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-netflix-bg-tertiary">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-netflix-red flex items-center justify-center">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={24} className="text-white" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-netflix-text-muted text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-netflix-text-secondary hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="border-b border-netflix-bg-tertiary">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-netflix-text-muted hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`px-6 py-4 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'watchlist'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-netflix-text-muted hover:text-white'
              }`}
            >
              <Heart size={16} />
              Watchlist
              <span className="ml-1 px-2 py-0.5 bg-netflix-bg-tertiary rounded-full text-xs">{watchlist.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'text-white border-b-2 border-netflix-red'
                  : 'text-netflix-text-muted hover:text-white'
              }`}
            >
              <Clock size={16} />
              View History
              <span className="ml-1 px-2 py-0.5 bg-netflix-bg-tertiary rounded-full text-xs">{viewHistory.length}</span>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-netflix-bg-tertiary rounded"></div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-netflix-bg-tertiary p-4 rounded-lg">
                    <p className="text-netflix-text-muted text-sm">Watchlist</p>
                    <p className="text-2xl font-bold text-white mt-1">{watchlist.length}</p>
                  </div>
                  <div className="bg-netflix-bg-tertiary p-4 rounded-lg">
                    <p className="text-netflix-text-muted text-sm">Views</p>
                    <p className="text-2xl font-bold text-white mt-1">{viewHistory.length}</p>
                  </div>
                  <div className="bg-netflix-bg-tertiary p-4 rounded-lg">
                    <p className="text-netflix-text-muted text-sm">Role</p>
                    <p className={`text-lg font-medium mt-1 ${user.role === 'admin' ? 'text-netflix-warning' : 'text-white'}`}>
                      {user.role === 'admin' && <Crown size={14} className="inline mr-1" />}
                      {user.role}
                    </p>
                  </div>
                  <div className="bg-netflix-bg-tertiary p-4 rounded-lg">
                    <p className="text-netflix-text-muted text-sm">Joined</p>
                    <p className="text-white font-medium mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'watchlist' && (
                <div>
                  {watchlist.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart size={40} className="mx-auto text-netflix-text-muted mb-3" />
                      <p className="text-netflix-text-muted">No movies in watchlist</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {watchlist.map((movie) => (
                        <div key={movie.id} className="relative group">
                          <img
                            src={getThumbnailUrl(movie.thumbnail, 'small', movie.title)}
                            alt={movie.title}
                            className="w-full h-40 object-cover rounded-lg"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, 'small', movie.title)}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 rounded-b-lg">
                            <p className="text-white text-sm font-medium truncate">{movie.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  {viewHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock size={40} className="mx-auto text-netflix-text-muted mb-3" />
                      <p className="text-netflix-text-muted">No view history</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {viewHistory.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-netflix-bg-tertiary rounded-lg">
                          <img
                            src={getThumbnailUrl(item.movie?.thumbnail, 'small', item.movie?.title)}
                            alt={item.movie?.title || 'Movie'}
                            className="w-16 h-20 object-cover rounded"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, 'small', item.movie?.title)}
                          />
                          <div className="flex-1">
                            <p className="text-white font-medium">{item.movie?.title || 'Unknown Movie'}</p>
                            <p className="text-netflix-text-muted text-sm">
                              Watched: {new Date(item.watchedAt).toLocaleString()}
                            </p>
                            {item.completed && (
                              <span className="text-xs text-green-400 mt-1 inline-block">Completed</span>
                            )}
                            {item.duration > 0 && !item.completed && (
                              <span className="text-xs text-netflix-text-muted mt-1 inline-block">{Math.floor(item.duration / 60)}m watched</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    profileImage: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      profileImage: user.profileImage || ''
    });
    setShowModal(true);
  };

  const handleViewActivity = (user) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(editingUser.id, formData);
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(id);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'user',
      profileImage: ''
    });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'role') {
      return a.role.localeCompare(b.role);
    }
    return 0;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-netflix-bg-tertiary rounded-lg text-white border border-transparent focus:outline-none focus:border-netflix-red cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="role">Role</option>
          </select>
          <span className="text-netflix-text-secondary">{users.length} users</span>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-netflix-bg-tertiary rounded"></div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <Users size={48} className="mx-auto text-netflix-text-muted mb-4" />
          <p className="text-netflix-text-secondary">No users registered yet</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">User Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedUsers.slice(0, 6).map((user) => (
                <UserActivityCard
                  key={user.id}
                  user={user}
                  onViewActivity={handleViewActivity}
                />
              ))}
            </div>
          </div>

          <div className="bg-netflix-bg-secondary rounded-lg overflow-hidden mt-8">
            <h2 className="text-lg font-semibold text-white p-4 border-b border-netflix-bg-tertiary">All Users</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead className="bg-netflix-bg-tertiary">
                  <tr>
                    <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">User</th>
                    <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Email</th>
                    <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Role</th>
                    <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Watchlist</th>
                    <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Joined</th>
                    <th className="px-6 py-3 text-right text-netflix-text-secondary text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user) => (
                    <tr key={user.id} className="border-t border-netflix-bg-tertiary">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-netflix-red flex items-center justify-center">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User size={20} className="text-white" />
                            )}
                          </div>
                          <span className="text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-netflix-text-secondary">{user.email}</td>
                      <td className="px-6 py-4">
                        {user.role === 'admin' ? (
                          <span className="flex items-center gap-1 text-netflix-warning">
                            <Crown size={16} />
                            Admin
                          </span>
                        ) : (
                          <span className="text-netflix-text-secondary">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-netflix-text-secondary">
                          <Heart size={14} />
                          {user.watchlistCount ?? (Array.isArray(user.watchlist) ? user.watchlist.length : 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-netflix-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleViewActivity(user)} 
                          className="text-netflix-text-secondary hover:text-white p-2"
                          title="View Activity"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(user)} 
                          className="text-netflix-text-secondary hover:text-white p-2"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)} 
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
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-netflix-bg-secondary rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-netflix-bg-tertiary">
              <h2 className="text-xl font-bold text-white">Edit User</h2>
              <button onClick={() => setShowModal(false)} className="text-netflix-text-secondary">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="input-field"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-netflix-text-secondary text-sm mb-2">Profile Image URL</label>
                <input
                  type="url"
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  className="input-field"
                  placeholder="https://..."
                />
              </div>

              <button type="submit" className="w-full btn-primary py-3">
                Update User
              </button>
            </form>
          </div>
        </div>
      )}

      {showActivityModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => { setShowActivityModal(false); setSelectedUser(null); }}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;