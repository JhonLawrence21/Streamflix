import { useState, useEffect } from 'react';
import { Users, User, Crown, Edit, Trash2, X } from 'lucide-react';
import { adminService } from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Users</h1>

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
        <div className="bg-netflix-bg-secondary rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-netflix-bg-tertiary">
                <tr>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">User</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Email</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Role</th>
                  <th className="px-6 py-3 text-left text-netflix-text-secondary text-sm">Joined</th>
                  <th className="px-6 py-3 text-right text-netflix-text-secondary text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
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
                    <td className="px-6 py-4 text-netflix-text-secondary">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
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
    </div>
  );
};

export default AdminUsersPage;