import { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import HeroBanner from '../components/home/HeroBanner';
import MovieRow from '../components/home/MovieRow';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { movieService, watchlistService, recommendationService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useParentalControls } from '../context/ParentalControlsContext';

const HomePage = () => {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryMovies, setCategoryMovies] = useState({});
  const [myList, setMyList] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { filterContent } = useParentalControls();

  useEffect(() => {
    console.log('[HomePage] Fetching data...');
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('[HomePage] Calling API...');
        
        const [trendingData, popularData, categoriesData, upcomingData] = await Promise.all([
          movieService.getTrending().catch(e => { console.warn('trending error', e); return []; }),
          movieService.getPopular().catch(e => { console.warn('popular error', e); return []; }),
          movieService.getCategories().catch(e => { console.warn('categories error', e); return []; }),
          movieService.getUpcoming().catch(e => { console.warn('upcoming error', e); return []; })
        ]);
        
        console.log('[HomePage] Data received:', { trending: trendingData?.length, popular: popularData?.length, categories: categoriesData?.length });

        const categoryMoviesData = {};
        if (categoriesData && categoriesData.length > 0) {
          // Ensure we pass *category name* exactly as stored in DB.
          // Admin categories and DB category strings must match for filtering to work.
          const moviePromises = categoriesData.map(async (cat) => {
            try {
              const movies = await movieService.getByCategory(cat.name);
              return { [cat.name]: filterContent(Array.isArray(movies) ? movies.slice(0, 20) : []) };
            } catch {
              return { [cat.name]: [] };
            }
          });

          const moviesResults = await Promise.all(moviePromises);
          moviesResults.forEach(result => {
            const [key, value] = Object.entries(result)[0];
            categoryMoviesData[key] = value;
          });
        }


        let forYouData = [];
        if (user?.id) {
          try {
            forYouData = await recommendationService.getForYou();
          } catch {
            forYouData = [];
          }
        }
        
        setTrending(Array.isArray(trendingData) ? trendingData.slice(0, 20) : []);
        setPopular(Array.isArray(popularData) ? popularData.slice(0, 20) : (popularData?.movies || []).slice(0, 20));
        setCategories(categoriesData || []);
        setCategoryMovies(categoryMoviesData);
        setUpcoming(Array.isArray(upcomingData) ? upcomingData : []);
        setForYou(Array.isArray(forYouData) ? forYouData.slice(0, 20) : []);
        console.log('[HomePage] State set successfully');
      } catch (error) {
        console.error('[HomePage] Error:', error);
        setError('Failed to load movies. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, filterContent]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (user) {
        try {
          const data = await watchlistService.get();
          if (Array.isArray(data)) {
            setWatchlist(data.map(m => m.id));
            setMyList(data.slice(0, 10));
          }
        } catch (error) {
          console.error('Error fetching watchlist:', error);
        }
      }
    };

    fetchWatchlist();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-netflix-bg">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-netflix-bg flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-xl text-netflix-text-secondary mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-netflix-red text-white px-8 py-3 rounded font-semibold hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasAnyContent = [trending, popular, ...Object.values(categoryMovies)].some(arr => arr.length > 0);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />
      <HeroBanner />
      
      <div className="relative -mt-32 z-10 pb-8">
        {forYou.length > 0 && user && (
          <MovieRow 
            title="Because You Watched" 
            movies={forYou} 
            onWatchlist={watchlist}
          />
        )}

        {upcoming.length > 0 && (
          <MovieRow 
            title="Upcoming Releases" 
            movies={upcoming} 
            onWatchlist={watchlist}
          />
        )}
        
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
        
        {user && myList.length > 0 && (
          <MovieRow 
            title="My List" 
            movies={myList} 
            onWatchlist={watchlist}
          />
        )}
        
        {categories.map((cat) => (
          <MovieRow 
            key={cat.id} 
            title={cat.name} 
            movies={categoryMovies[cat.name] || []} 
            onWatchlist={watchlist}
          />
        ))}
      </div>

      {!hasAnyContent && (
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <div className="animate-pulse w-24 h-24 bg-netflix-bg-tertiary rounded-full mx-auto mb-8"></div>
          <h2 className="text-3xl font-bold text-white mb-4">No movies available yet</h2>
          <p className="text-xl text-netflix-text-secondary mb-8 max-w-md">
            We're working on bringing you the best movies and shows. Check back soon!
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-netflix-red text-white px-8 py-3 rounded font-semibold hover:bg-red-700"
          >
            Refresh
          </button>
        </div>
      )}
      
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

