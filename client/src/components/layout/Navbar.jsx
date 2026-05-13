import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
    setProfileOpen(false);
  };

  const isAdmin = user && user.role === 'admin';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-netflix-bg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/" className="text-netflix-red text-xl md:text-3xl font-bold tracking-tight">
            STREAMFLIX
          </Link>
          
          <div className={`hidden md:flex items-center gap-6 ${scrolled ? 'opacity-100' : 'opacity-100'}`}>
            <Link to="/" className="text-netflix-text text-sm hover:text-netflix-text-secondary transition-colors">Home</Link>
            <Link to="/search?category=Action" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">Action</Link>
            <Link to="/search?category=Drama" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">Drama</Link>
            <Link to="/upcoming" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">Upcoming</Link>
            {user && (
              <Link to="/watchlist" className="text-netflix-text-secondary text-sm hover:text-white transition-colors">My List</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center flex-1 max-w-xs md:max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-netflix-bg-tertiary border border-netflix-text-muted rounded px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base text-white placeholder-netflix-text-muted focus:outline-none focus:border-netflix-red"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="ml-1 md:ml-2 text-netflix-text-secondary hover:text-white">
                <X size={18} />
              </button>
            </form>
          ) : (
            <>
              <button onClick={() => setSearchOpen(true)} className="text-netflix-text hover:text-netflix-text-secondary transition-colors">
                <Search size={24} />
              </button>
              
              {user && (
                <Link to="/watchlist" className="text-gray-300 hover:text-white">
                  <span className="sr-only">My List</span>
                  <span aria-hidden className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-netflix-bg-tertiary text-white/80 text-lg leading-none">
                    +
                  </span>
                </Link>
              )}

              
              {!user ? (
                <Link to="/login" className="text-xs md:text-sm text-white hover:text-netflix-text-secondary">Sign In</Link>
              ) : (
                <div className="relative">
                  <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 text-netflix-text hover:text-netflix-text-secondary">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-netflix-red">
                      {user.profileImage ? (
                        <img 
                          src={user.profileImage} 
                          alt={user.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User size={16} className="text-white" />
                      )}
                    </div>
                  </button>
                  
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-netflix-bg-secondary rounded shadow-lg py-2">
                      <div className="px-4 py-2 border-b border-netflix-bg-tertiary">
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-netflix-text-secondary text-sm">{user.email}</p>
                        {isAdmin && <span className="text-netflix-red text-xs">Admin</span>}
                      </div>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-netflix-text hover:text-white hover:bg-netflix-bg-tertiary" onClick={() => setProfileOpen(false)}>
                          <Settings size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/profiles" className="flex items-center gap-2 px-4 py-2 text-netflix-text hover:text-white hover:bg-netflix-bg-tertiary" onClick={() => setProfileOpen(false)}>
                        <User size={16} /> Manage Profiles
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-netflix-text hover:text-white hover:bg-netflix-bg-tertiary" onClick={() => setProfileOpen(false)}>
                        <Settings size={16} /> Settings
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-netflix-text hover:text-white hover:bg-netflix-bg-tertiary">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
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
            <Link to="/upcoming" className="text-netflix-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Upcoming</Link>
            {user && (
              <>
                <Link to="/watchlist" className="text-netflix-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>My List</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-netflix-red py-2" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
                )}
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-netflix-text-secondary py-2 text-left">Sign Out</button>
              </>
            )}
            {!user && (
              <Link to="/login" className="text-netflix-text-secondary py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;