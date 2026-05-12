import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Lock, Unlock, User } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { authService } from '../services/api';

const AVATARS = [
  '🦁', '🐯', '🐻', '🐼', '🐨', '🐸',
  '🦊', '🐰', '🐶', '🐱', '🦄', '🐲',
  '🦋', '🐢', '🦀', '🐙', '🦑', '🐳',
  '🌟', '🌙', '☀️', '🌈', '🔥', '💎'
];

const ProfileCard = ({ profile, isActive, onSelect, onEdit, onDelete, onToggleKid }) => {
  const navigate = useNavigate();

  const handleSelect = () => {
    if (onSelect) onSelect(profile.id);
  };

  return (
    <div className="relative group">
      <div
        onClick={handleSelect}
        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
          isActive ? 'ring-4 ring-netflix-red' : ''
        } rounded-lg`}
      >
        <div className={`w-32 h-32 mx-auto rounded-lg flex items-center justify-center text-6xl ${
          isActive ? 'bg-netflix-red' : 'bg-netflix-bg-tertiary'
        }`}>
          {profile.avatar || <User className="w-16 h-16 text-white" />}
        </div>
        <div className="mt-3 text-center">
          <p className={`font-medium ${isActive ? 'text-white' : 'text-netflix-text-secondary'}`}>
            {profile.name}
          </p>
          {profile.isKid && (
            <span className="text-xs text-netflix-warning">Kids</span>
          )}
        </div>
      </div>

      <div className="absolute top-0 right-0 mt-2 mr-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(profile)}
            className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black"
          >
            <Edit2 size={14} className="text-white" />
          </button>
        )}
        {onToggleKid && (
          <button
            onClick={() => onToggleKid(profile)}
            className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black"
          >
            {profile.isKid ? <Lock size={14} className="text-netflix-warning" /> : <Unlock size={14} className="text-green-400" />}
          </button>
        )}
        <button
          onClick={() => onDelete(profile.id)}
          className="w-8 h-8 rounded-full bg-black/70 flex items-center justify-center hover:bg-black"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
      </div>
    </div>
  );
};

const ProfileModal = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile?.name || '');
  const [avatar, setAvatar] = useState(profile?.avatar || '');
  const [pin, setPin] = useState(profile?.pin || '');
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ ...profile, name, avatar, pin, isKid: profile?.isKid || false });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-netflix-bg-secondary rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">
          {profile?.id ? 'Edit Profile' : 'Create Profile'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 text-center">
            <div className="w-24 h-24 mx-auto rounded-lg bg-netflix-bg-tertiary flex items-center justify-center text-5xl mb-4">
              {avatar || <User className="w-12 h-12 text-white" />}
            </div>
            <p className="text-sm text-netflix-text-secondary">Choose an avatar</p>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-6 max-h-40 overflow-y-auto">
            {AVATARS.map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatar(a)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                  avatar === a ? 'bg-netflix-red ring-2 ring-white' : 'bg-netflix-bg-tertiary hover:bg-gray-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-netflix-text-secondary mb-2">Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-4 py-3 text-white placeholder-netflix-text-muted focus:outline-none focus:border-netflix-red"
              placeholder="Enter profile name"
              maxLength={20}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-netflix-text-secondary mb-2">
              Parental Control PIN (optional)
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-4 py-3 text-white placeholder-netflix-text-muted focus:outline-none focus:border-netflix-red"
                placeholder="4-digit PIN"
                maxLength={4}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-netflix-text-muted"
              >
                {showPin ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded bg-netflix-bg-tertiary text-white hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded bg-netflix-red text-white hover:bg-red-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProfilesPage = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState('default');
  const [showModal, setShowModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setProfiles(user.profiles || [{ id: 'default', name: 'Main', avatar: '', isKid: false, pin: '' }]);
        setActiveProfile(user.activeProfile || 'default');
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = async (profileId) => {
    try {
      await authService.updateProfile({ activeProfile: profileId });
      setActiveProfile(profileId);
      const userData = JSON.parse(localStorage.getItem('user'));
      userData.activeProfile = profileId;
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
    } catch (error) {
      console.error('Error selecting profile:', error);
    }
  };

  const handleSaveProfile = async (profile) => {
    try {
      let newProfiles;
      if (profile.id) {
        newProfiles = profiles.map(p => p.id === profile.id ? profile : p);
      } else {
        const newProfile = { ...profile, id: Date.now().toString() };
        newProfiles = [...profiles, newProfile];
      }

      await authService.updateProfile({ profiles: newProfiles });
      setProfiles(newProfiles);

      const userData = JSON.parse(localStorage.getItem('user'));
      userData.profiles = newProfiles;
      localStorage.setItem('user', JSON.stringify(userData));

      setShowModal(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (profiles.length <= 1) {
      alert('You must have at least one profile');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this profile?')) return;

    try {
      const newProfiles = profiles.filter(p => p.id !== profileId);
      await authService.updateProfile({ profiles: newProfiles });
      setProfiles(newProfiles);

      const userData = JSON.parse(localStorage.getItem('user'));
      userData.profiles = newProfiles;
      if (activeProfile === profileId) {
        userData.activeProfile = newProfiles[0].id;
        setActiveProfile(newProfiles[0].id);
      }
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleToggleKid = async (profile) => {
    const updatedProfile = { ...profile, isKid: !profile.isKid };
    await handleSaveProfile(updatedProfile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-netflix-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <div className="pt-32 px-4 md:px-12 max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
          Who's Watching?
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {profiles.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isActive={activeProfile === profile.id}
              onSelect={handleSelectProfile}
              onEdit={(p) => { setEditingProfile(p); setShowModal(true); }}
              onDelete={handleDeleteProfile}
              onToggleKid={handleToggleKid}
            />
          ))}

          {profiles.length < 5 && (
            <div className="flex flex-col items-center">
              <button
                onClick={() => { setEditingProfile({}); setShowModal(true); }}
                className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-white transition-colors"
              >
                <Plus size={48} className="text-gray-600" />
              </button>
              <p className="mt-3 text-netflix-text-secondary">Add Profile</p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <ProfileModal
          profile={editingProfile}
          onSave={handleSaveProfile}
          onClose={() => { setShowModal(false); setEditingProfile(null); }}
        />
      )}
    </div>
  );
};

export default ProfilesPage;