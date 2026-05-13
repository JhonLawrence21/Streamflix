import { useState, useEffect } from 'react';
import { Users, Film, Eye, TrendingUp, Clock, Star, Activity } from 'lucide-react';
import { adminService } from '../../services/api';

const StatCard = ({ label, value, icon: Icon, color, trend }) => (
  <div className="bg-netflix-bg-secondary p-6 rounded-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-netflix-text-secondary text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-2">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}% from last week
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-${color}/20`}>
        <Icon className={`text-${color}`} size={28} />
      </div>
    </div>
  </div>
);

const SimpleBarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-netflix-bg-secondary p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <span className="w-24 text-netflix-text-secondary text-sm truncate">{item.label}</span>
            <div className="flex-1 bg-netflix-bg-tertiary rounded-full h-6 overflow-hidden">
              <div
                className="h-full bg-netflix-red rounded-full transition-all duration-500"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
            <span className="text-white text-sm w-12 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const timeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
};

const ActivityFeed = ({ activities }) => (
  <div className="bg-netflix-bg-secondary p-6 rounded-lg">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Activity size={20} />
      Recent Activity
    </h3>
    <div className="space-y-4 max-h-80 overflow-y-auto">
      {activities.length === 0 ? (
        <p className="text-netflix-text-muted text-center py-4">No recent activity</p>
      ) : (
        activities.map((activity, index) => (
          <div key={activity.id || index} className="flex items-start gap-3 pb-3 border-b border-netflix-bg-tertiary last:border-0">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              activity.type === 'view' ? 'bg-blue-500' :
              activity.type === 'watchlist' ? 'bg-green-500' :
              activity.type === 'signup' ? 'bg-purple-500' : 'bg-gray-500'
            }`} />
            <div className="flex-1">
              <p className="text-white text-sm">{activity.message}</p>
              <p className="text-netflix-text-muted text-xs mt-1">
                {activity.userName ? `${activity.userName} - ` : ''}{timeAgo(activity.createdAt)}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const TopMoviesCard = ({ movies }) => (
  <div className="bg-netflix-bg-secondary p-6 rounded-lg">
    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
      <Star size={20} className="text-netflix-warning" />
      Top Rated Movies
    </h3>
    <div className="space-y-3">
      {movies.length === 0 ? (
        <p className="text-netflix-text-muted text-center py-4">No movies yet</p>
      ) : (
        movies.slice(0, 5).map((movie, index) => (
          <div key={movie.id} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-netflix-red flex items-center justify-center text-white text-xs font-bold">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="text-white text-sm truncate">{movie.title}</p>
              <p className="text-netflix-text-muted text-xs">{movie.views || 0} views</p>
            </div>
            <span className="text-netflix-warning text-sm">{movie.rating?.toFixed(1) || 'N/A'}</span>
          </div>
        ))
      )}
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, activityData] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getActivity(20)
        ]);
        setAnalytics(data);
        setActivities(activityData || []);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(async () => {
      try {
        const activityData = await adminService.getActivity(20);
        setActivities(activityData || []);
      } catch (e) { /* ignore */ }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-netflix-bg-tertiary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categoryData = analytics?.moviesByCategory?.map(cat => ({
    label: cat.category || 'Uncategorized',
    value: cat.count
  })) || [];

  const statusData = [
    { label: 'Released', value: analytics?.releasedCount || 0 },
    { label: 'Upcoming', value: analytics?.upcomingCount || 0 },
    { label: 'In Production', value: analytics?.inProductionCount || 0 },
  ];

  const topMovies = analytics?.topMovies || [];

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-netflix-text-secondary text-sm">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard
          label="Total Users"
          value={analytics?.totalUsers || 0}
          icon={Users}
          color="text-blue-500"
          trend={12}
        />
        <StatCard
          label="Total Movies"
          value={analytics?.totalMovies || 0}
          icon={Film}
          color="text-netflix-red"
          trend={5}
        />
        <StatCard
          label="Total Views"
          value={(analytics?.totalViews || 0).toLocaleString()}
          icon={Eye}
          color="text-netflix-success"
          trend={23}
        />
        <StatCard
          label="Avg. Rating"
          value={analytics?.avgRating?.toFixed(1) || '0.0'}
          icon={Star}
          color="text-netflix-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SimpleBarChart data={categoryData} title="Movies by Category" />
        <SimpleBarChart data={statusData} title="Movies by Status" />
        <ActivityFeed activities={activities} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopMoviesCard movies={topMovies} />

        <div className="bg-netflix-bg-secondary p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-500" />
            Trending Now
          </h3>
          <div className="space-y-3">
            {topMovies.slice(0, 5).map((movie, index) => (
              <div key={movie.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">
                  <TrendingUp size={12} />
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm truncate">{movie.title}</p>
                </div>
                <span className="text-netflix-text-muted text-xs">{movie.views || 0} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;