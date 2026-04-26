import { useState, useEffect } from 'react';
import { Users, Film, Eye } from 'lucide-react';
import { adminService } from '../../services/api';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-netflix-bg-tertiary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Users',
      value: analytics?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Total Movies',
      value: analytics?.totalMovies || 0,
      icon: Film,
      color: 'text-netflix-red'
    },
    {
      label: 'Total Views',
      value: analytics?.totalViews?.toLocaleString() || 0,
      icon: Eye,
      color: 'text-netflix-success'
    }
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-netflix-bg-secondary p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-netflix-text-secondary text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              </div>
              <stat.icon className={stat.color} size={32} />
            </div>
          </div>
        ))}
      </div>

      {analytics?.moviesByCategory && analytics.moviesByCategory.length > 0 && (
        <div className="bg-netflix-bg-secondary p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Movies by Category</h2>
          <div className="space-y-3">
            {analytics.moviesByCategory.map((cat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-netflix-text-secondary">{cat.category || 'Uncategorized'}</span>
                <span className="text-white font-semibold">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-netflix-bg-secondary p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Movies</h2>
        {analytics?.recentMovies && analytics.recentMovies.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="text-netflix-text-secondary text-left">
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Views</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentMovies.map((movie, index) => (
                  <tr key={index} className="border-t border-netflix-bg-tertiary">
                    <td className="py-3 text-white">{movie.title}</td>
                    <td className="py-3 text-netflix-text-secondary">{movie.category}</td>
                    <td className="py-3 text-netflix-success">{movie.rating?.toFixed(1) || 'N/A'}</td>
                    <td className="py-3 text-netflix-text-secondary">{movie.views || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-netflix-text-secondary">No movies yet</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;