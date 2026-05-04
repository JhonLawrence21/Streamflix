import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
// const { user, logout } = useAuth();
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
            <Link to="/upcoming" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">Upcoming</Link>
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
              
<Link to="/watchlist" className="text-gray-300 hover:text-white">
                  <div style={{width: '24px', height: '24px'}}>+</div>
                </Link>
              
              <div className="relative group">
                <button className="text-netflix-text hover:text-netflix-text-secondary transition-colors">
                  <Bell size={24} />
                </button>
              </div>
              
<Link to="/login" className="bg-[#E50914] hover:bg-[#b20710] text-white px-6 py-2 rounded font-semibold text-sm">Sign In</Link>
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
            <Link to="/upcoming" className="text-netflix-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Upcoming</Link>
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