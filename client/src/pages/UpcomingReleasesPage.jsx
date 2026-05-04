import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import MovieCard from '../components/movie/MovieCard';
import { movieService } from '../services/api';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const UpcomingReleasesPage = () => {
  const navigate = useNavigate();
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [releases, setReleases] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 1 + i);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [releasesData, upcomingData] = await Promise.all([
        movieService.getReleasesByMonth(selectedYear, selectedMonth),
        movieService.getUpcoming()
      ]);
      setReleases(releasesData);
      setUpcoming(upcomingData);
    } catch (error) {
      console.error('Error fetching releases:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  return (
    <div className="min-h-screen bg-netflix-bg">
      <Navbar />

      <div className="px-12 pt-24 pb-8">
        <h1 className="text-4xl font-bold text-white mb-8">Releases by Month</h1>

        <div className="flex gap-4 mb-8">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="bg-netflix-card text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-netflix-red"
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-netflix-card text-white px-4 py-2 rounded border border-gray-600 focus:outline-none focus:border-netflix-red"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-white text-center py-12">Loading...</div>
        ) : (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">
                {MONTHS[selectedMonth - 1]} {selectedYear} Releases
              </h2>
              {releases.length === 0 ? (
                <p className="text-netflix-text-secondary">No releases this month</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {releases.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Upcoming Releases</h2>
              {upcoming.length === 0 ? (
                <p className="text-netflix-text-secondary">No upcoming releases</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {upcoming.map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onClick={() => navigate(`/movie/${movie.id}`)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default UpcomingReleasesPage;
