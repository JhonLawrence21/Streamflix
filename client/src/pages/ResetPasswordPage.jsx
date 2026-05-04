import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ResetPasswordPage = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const otpParam = searchParams.get('otp');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      navigate('/forgot-password');
    }
    if (otpParam) {
      setOtp(otpParam);
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (otp.length !== 6) {
      setError('Enter valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email, otp, newPassword);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <Link to="/forgot-password" className="flex items-center text-netflix-text-secondary mb-4 hover:text-white">
          <ArrowLeft size={20} className="mr-2" />
          Back
        </Link>
        
        <div className="bg-netflix-bg-secondary p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Reset Password</h1>
          <p className="text-netflix-text-secondary mb-6">Enter OTP and new password for <strong>{email}</strong></p>

          {otp.length === 6 && (
            <div className="bg-green-900/50 border border-green-500 rounded p-4 mb-4 text-center">
              <p className="text-green-200 text-sm mb-1">Your Reset OTP Code:</p>
              <p className="text-white text-3xl font-bold tracking-widest">{otp}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                maxLength="6"
                className="input-field pl-12"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="input-field pl-12 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                className="input-field pl-12"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

