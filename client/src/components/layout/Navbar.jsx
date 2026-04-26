import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-netflix-bg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-netflix-red text-3xl font-bold tracking-tight">
            STREAMFLIX
          </Link>
          
          <div className={`hidden md:flex items-center gap-6 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
            <Link to="/" className="text-netflix-text text-sm hover:text-netflix-text-secondary transition-colors">Home</Link>
            <Link to="/search?category=Action" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">Action</Link>
            <Link to="/search?category=Drama" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">Drama</Link>
            <Link to="/watchlist" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">My List</Link>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-4 py-2 text-white placeholder-netflix-text-muted focus:outline-none focus:border-netflix-red"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="ml-2 text-netflix-text-secondary">
                <X size={20} />
              </button>
            </form>
          ) : (
            <>
              <button onClick={() => setSearchOpen(true)} className="text-netflix-text hover:text-netflix-text-secondary transition-colors">
                <Search size={24} />
              </button>
              
              {user && (
                <Link to="/watchlist" className="text-netflix-text hover:text-netflix-text-secondary transition-colors">
                  <Plus size={24} />
                </Link>
              )}
              
              <div className="relative group">
                <button className="text-netflix-text hover:text-netflix-text-secondary transition-colors">
                  <Bell size={24} />
                </button>
              </div>
              
              {user ? (
                <div className="relative group">
                  <button className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-netflix-red flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-netflix-bg-secondary rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-2">
                      <p className="px-4 py-2 text-sm text-netflix-text-secondary">{user.email}</p>
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-netflix-bg-tertiary transition-colors">Profile</Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-netflix-bg-tertiary transition-colors">Admin Panel</Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-netflix-bg-tertiary transition-colors">Sign Out</button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm">Sign In</Link>
              )}
            </>
          )}
          
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-netflix-text">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-netflix-bg border-t border-netflix-bg-tertiary">
          <div className="flex flex-col p-4 gap-4">
            <Link to="/" className="text-netflix-text py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/search?category=Action" className="text-netflix-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Action</Link>
            <Link to="/search?category=Drama" className="text-netflix-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Drama</Link>
            {user && (
              <Link to="/watchlist" className="text-netflix-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>My List</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;