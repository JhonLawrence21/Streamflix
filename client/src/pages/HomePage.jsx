import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroBanner from '../components/home/HeroBanner';
import MovieRow from '../components/home/MovieRow';
import { movieService, watchlistService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [action, setAction] = useState([]);
  const [drama, setDrama] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, popularData, actionData, dramaData, comedyData] = await Promise.all([
          movieService.getTrending(),
          movieService.getAll({ category: 'Popular', limit: 10 }),
          movieService.getByCategory('Action'),
          movieService.getByCategory('Drama'),
          movieService.getByCategory('Comedy')
        ]);
        
        setTrending(trendingData.slice(0, 10));
        setPopular(popularData.movies || popularData.slice(0, 10));
        setAction(actionData.slice(0, 10));
        setDrama(dramaData.slice(0, 10));
        setComedy(comedyData.slice(0, 10));
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user) {
        try {
          const data = await watchlistService.get();
          setWatchlist(data.map(m => m.id));
        } catch (error) {
          console.error('Error fetching watchlist:', error);
        }
      }
    };

    fetchWatchlist();
  }, [user]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <HeroBanner />
      
      <div className="relative -mt-32 z-10 pb-8">
        <MovieRow 
          title="Trending Now" 
          movies={trending} 
          onWatchlist={watchlist}
        />
        
        <MovieRow 
          title="Popular on StreamFlix" 
          movies={popular} 
          onWatchlist={watchlist}
        />
        
        <MovieRow 
          title="Action Movies" 
          movies={action} 
          onWatchlist={watchlist}
        />
        
        <MovieRow 
          title="Drama" 
          movies={drama} 
          onWatchlist={watchlist}
        />
        
        <MovieRow 
          title="Comedy" 
          movies={comedy} 
          onWatchlist={watchlist}
        />
      </div>
      
      <footer className="py-8 px-12 text-netflix-text-secondary text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
          <div>
            <p>Audio and Subtitles</p>
            <p>Media Center</p>
            <p>Privacy</p>
            <p>Contact Us</p>
          </div>
          <div>
            <p>Audio Description</p>
            <p>Investor Relations</p>
            <p>Legal Notices</p>
          </div>
          <div>
            <p>Help Center</p>
            <p>Jobs</p>
            <p>Cookie Preferences</p>
          </div>
          <div>
            <p>Gift Cards</p>
            <p>Terms of Use</p>
            <p>Corporate Information</p>
          </div>
        </div>
        <p className="mt-4">© 2026 StreamFlix, Alright Reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;