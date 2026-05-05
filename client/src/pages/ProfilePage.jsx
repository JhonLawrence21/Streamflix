import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Save, Camera } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { authService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage('Image must be less than 2MB');
        setIsSuccess(false);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
        setMessage('');
      };
      reader.onerror = () => {
        setMessage('Failed to read file');
        setIsSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, profileImage: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsSuccess(false);

    try {
      const res = await authService.updateProfile(formData);
      const updatedUser = { ...user, ...res };
      updateUser(updatedUser);
      setMessage('Profile updated successfully!');
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <Navbar />
        <div className="pt-24 px-4 md:px-8">
          <div className="max-w-md mx-auto text-center">
            <p className="text-netflix-text-secondary">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <div className="pt-24 px-4 md:px-8">
        <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-netflix-red flex items-center justify-center overflow-hidden">
                {formData.profileImage && formData.profileImage.startsWith('data:image') ? (
                  <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                ) : formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-white" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-netflix-red p-2 rounded-full hover:bg-red-700 transition-colors"
              >
                <Camera size={16} className="text-white" />
              </button>
              {formData.profileImage && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 bg-gray-600 p-1 rounded-full hover:bg-gray-700 transition-colors text-xs"
                >
                  ✕
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-netflix-text-secondary text-sm mb-2">Name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-netflix-text-muted" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-netflix-text-secondary text-sm mb-2">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-netflix-text-muted" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-netflix-text-secondary text-sm mb-2">Profile Image</label>
            <p className="text-xs text-netflix-text-muted mb-2">Click the camera icon above to upload a file, or paste a URL below:</p>
            <input
              type="url"
              value={formData.profileImage && formData.profileImage.startsWith('data:') ? '' : formData.profileImage}
              onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
              className="input-field"
              placeholder="https://example.com/image.jpg"
              disabled={formData.profileImage && formData.profileImage.startsWith('data:image')}
            />
            {formData.profileImage && formData.profileImage.startsWith('data:image') && (
              <p className="text-xs text-green-500 mt-1">✓ Image uploaded (file)</p>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded ${isSuccess ? 'bg-green-600' : 'bg-netflix-red'}`}>
              <p className="text-white text-sm">{message}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;