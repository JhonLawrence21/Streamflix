import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Key, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      navigate('/register');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(email, otp);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <button onClick={() => navigate('/register')} className="flex items-center text-netflix-text-secondary mb-4 hover:text-white">
          <ArrowLeft size={20} className="mr-2" />
          Back to register
        </button>
        
        <div className="bg-netflix-bg-secondary p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Verify Email</h1>
          <p className="text-netflix-text-secondary mb-6">Enter OTP sent to <strong>{email}</strong></p>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-12"
                readOnly
              />
            </div>

            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                className="input-field pl-12"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;

