import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [readOnly, setReadOnly] = useState(true);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setReadOnly(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    } else if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user && user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <Link to="/" className="block text-center text-netflix-red text-4xl font-bold tracking-tight mb-8">
          STREAMFLIX
        </Link>

        <div className="bg-netflix-bg-secondary p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-white mb-6">Sign In</h1>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or phone number"
                className="input-field pl-12"
                autoComplete="off"
                readOnly={readOnly}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-netflix-text-muted" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="input-field pl-12 pr-12"
                autoComplete="off"
                readOnly={readOnly}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-netflix-text-secondary hover:text-white text-sm">
              Forgot password?
            </Link>
          </div>

          <div className="mt-6 text-center text-netflix-text-secondary">
            Don't have an account?{' '}
            <Link to="/register" className="text-white hover:underline">
              Sign up now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;