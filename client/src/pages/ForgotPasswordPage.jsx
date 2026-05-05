import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/api';

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword({ email });
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.resetPassword({ resetCode, newPassword });
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center text-netflix-red text-3xl md:text-4xl font-bold tracking-tight mb-6 md:mb-8">
          STREAMFLIX
        </Link>

        <div className="bg-netflix-bg-secondary p-6 md:p-8 rounded-lg">
          {step === 1 ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-6">Forgot Password</h1>
              <p className="text-netflix-text-secondary mb-6 text-sm">Enter your email to receive a reset code.</p>

              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-2 rounded mb-4">
                  {message}
                </div>
              )}

              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input-field pl-12"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="text-netflix-text-secondary hover:text-white flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back to Sign In
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-6">Reset Password</h1>
              <p className="text-netflix-text-secondary mb-6 text-sm">Enter the reset code and your new password.</p>

              {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-2 rounded mb-4">
                  {message}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter reset code"
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
                    placeholder="New password"
                    className="input-field pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-netflix-text-muted"
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
                    placeholder="Confirm new password"
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

              <div className="mt-6 text-center">
                <button 
                  onClick={() => { setStep(1); setMessage(''); setError(''); }}
                  className="text-netflix-text-secondary hover:text-white"
                >
                  Didn't receive a code? Try again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;