import { useState, useEffect } from 'react';
import { Flag, Eye, CheckCircle, XCircle, Clock, AlertTriangle, Filter } from 'lucide-react';
import { adminService } from '../../services/api';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    dismissed: 0
  });

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const mockReports = [
        {
          id: 1,
          type: 'broken_video',
          movieId: 5,
          movieTitle: 'The Matrix',
          userId: 23,
          userName: 'John Doe',
          message: 'Video playback freezes at 45:30 mark',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          type: 'inappropriate_content',
          movieId: 12,
          movieTitle: 'Sample Movie',
          userId: 45,
          userName: 'Jane Smith',
          message: 'Description contains inappropriate language',
          status: 'pending',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: 'missing_subtitles',
          movieId: 8,
          movieTitle: 'Inception',
          userId: 67,
          userName: 'Bob Wilson',
          message: 'No English subtitles available',
          status: 'resolved',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          type: 'broken_link',
          movieId: 15,
          movieTitle: 'Breaking Bad S01',
          userId: 89,
          userName: 'Alice Brown',
          message: 'External link is not working',
          status: 'dismissed',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ];

      setReports(mockReports);
      setStats({
        total: mockReports.length,
        pending: mockReports.filter(r => r.status === 'pending').length,
        resolved: mockReports.filter(r => r.status === 'resolved').length,
        dismissed: mockReports.filter(r => r.status === 'dismissed').length
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      setReports(reports.map(r =>
        r.id === reportId ? { ...r, status: newStatus } : r
      ));
      setStats(prev => ({
        ...prev,
        pending: reports.filter(r => r.status === 'pending' || (r.id === reportId && newStatus === 'pending')).length,
        resolved: reports.filter(r => r.status === 'resolved' || (r.id === reportId && newStatus === 'resolved')).length,
        dismissed: reports.filter(r => r.status === 'dismissed' || (r.id === reportId && newStatus === 'dismissed')).length
      }));
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'broken_video': return <AlertTriangle size={18} className="text-red-500" />;
      case 'inappropriate_content': return <Flag size={18} className="text-orange-500" />;
      case 'missing_subtitles': return <Flag size={18} className="text-yellow-500" />;
      case 'broken_link': return <XCircle size={18} className="text-blue-500" />;
      default: return <Flag size={18} className="text-gray-500" />;
    }
  };

  const getTypeLabel = (type) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50',
      resolved: 'bg-green-600/20 text-green-400 border-green-600/50',
      dismissed: 'bg-gray-600/20 text-gray-400 border-gray-600/50'
    };
    const icons = {
      pending: Clock,
      resolved: CheckCircle,
      dismissed: XCircle
    };
    const Icon = icons[status];

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${styles[status]}`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredReports = filter === 'all'
    ? reports
    : reports.filter(r => r.status === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Moderation</h1>
          <p className="text-netflix-text-secondary text-sm mt-1">Manage user reports and content issues</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Reports', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-400' },
          { label: 'Dismissed', value: stats.dismissed, color: 'text-gray-400' }
        ].map((stat, index) => (
          <div key={index} className="bg-netflix-bg-secondary p-4 rounded-lg">
            <p className="text-netflix-text-secondary text-sm">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'resolved', 'dismissed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              filter === status
                ? 'bg-netflix-red text-white'
                : 'bg-netflix-bg-secondary text-netflix-text-secondary hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-netflix-bg-tertiary rounded-lg"></div>
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16">
          <Flag size={48} className="mx-auto text-netflix-text-muted mb-4" />
          <p className="text-netflix-text-secondary">
            {filter === 'all' ? 'No reports yet' : `No ${filter} reports`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-netflix-bg-secondary rounded-lg p-6 hover:bg-netflix-bg-tertiary transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(report.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-white font-medium">{getTypeLabel(report.type)}</span>
                    {getStatusBadge(report.status)}
                  </div>

                  <p className="text-netflix-text mb-2">{report.message}</p>

                  <div className="flex flex-wrap gap-4 text-sm text-netflix-text-secondary">
                    <span>Movie: <span className="text-white">{report.movieTitle}</span></span>
                    <span>Reported by: <span className="text-white">{report.userName}</span></span>
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {report.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleStatusChange(report.id, 'resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Resolve
                    </button>
                    <button
                      onClick={() => handleStatusChange(report.id, 'dismissed')}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <XCircle size={16} />
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;