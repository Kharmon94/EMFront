'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { StatCard } from '@/components/admin/StatCard';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { 
  FiShield, FiUsers, FiDollarSign, FiMusic, FiFlag, FiCheckCircle,
  FiTrendingUp, FiActivity, FiAlertTriangle, FiBarChart2, FiGrid,
  FiEye, FiEdit, FiTrash2, FiStar, FiX, FiCheck, FiSearch, FiFilter
} from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

type AdminSection = 'overview' | 'users' | 'content' | 'verifications' | 'reports' | 'analytics' | 'revenue';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await api.get('/auth/me');
        const currentUser = response.data.user;
        
        if (currentUser.role !== 'admin') {
          toast.error('Admin access required');
          router.push('/');
          return;
        }
        
        setUser(currentUser);
        setLoading(false);
      } catch (error) {
        toast.error('Please sign in to access admin panel');
        router.push('/');
      }
    };

    checkAdminAccess();
  }, [router]);

  // Fetch dashboard data
  const { data: dashboardData } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => api.get('/admin/dashboard'),
    enabled: !!user,
  });

  const { data: usersData, refetch: refetchUsers } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get('/admin/users'),
    enabled: activeSection === 'users',
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => api.get('/admin/analytics?period=30d'),
    enabled: activeSection === 'analytics',
  });

  const { data: revenueData } = useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: () => api.get('/admin/revenue'),
    enabled: activeSection === 'revenue',
  });

  const { data: contentData, refetch: refetchContent } = useQuery({
    queryKey: ['admin', 'content'],
    queryFn: () => api.get('/admin/content'),
    enabled: activeSection === 'content',
  });

  if (loading || !user) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </main>
      </>
    );
  }

  const sidebarItems = [
    { id: 'overview' as AdminSection, label: 'Overview', icon: FiGrid },
    { id: 'users' as AdminSection, label: 'Users', icon: FiUsers },
    { id: 'content' as AdminSection, label: 'Content', icon: FiMusic },
    { id: 'verifications' as AdminSection, label: 'Verifications', icon: FiCheckCircle },
    { id: 'reports' as AdminSection, label: 'Reports', icon: FiFlag },
    { id: 'analytics' as AdminSection, label: 'Analytics', icon: FiBarChart2 },
    { id: 'revenue' as AdminSection, label: 'Revenue', icon: FiDollarSign },
  ];

  const stats = dashboardData?.data?.stats;
  const growth = dashboardData?.data?.growth;
  const quickStats = dashboardData?.data?.quick_stats;
  const recentActivity = dashboardData?.data?.recent_activity;

  return (
    <>
      <Navigation />
      
      <div className="min-h-screen bg-black pt-6 pb-24 md:pb-6">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400">Platform management and monitoring</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 sticky top-20">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors mb-1 ${
                        activeSection === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {activeSection === 'overview' && (
                <OverviewSection stats={stats} growth={growth} quickStats={quickStats} recentActivity={recentActivity} />
              )}
              {activeSection === 'users' && (
                <UsersSection usersData={usersData} refetchUsers={refetchUsers} />
              )}
              {activeSection === 'content' && (
                <ContentSection contentData={contentData} refetchContent={refetchContent} />
              )}
              {activeSection === 'verifications' && (
                <VerificationsSection />
              )}
              {activeSection === 'reports' && (
                <ReportsSection />
              )}
              {activeSection === 'analytics' && (
                <AnalyticsSection analyticsData={analyticsData} />
              )}
              {activeSection === 'revenue' && (
                <RevenueSection revenueData={revenueData} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Overview Section
function OverviewSection({ stats, growth, quickStats, recentActivity }: any) {
  if (!stats) return <div className="text-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={stats.total_users?.toLocaleString()}
          icon={FiUsers}
          trend={growth?.users_growth_percentage}
          trendLabel="vs last 30 days"
          iconColor="text-blue-400"
        />
        <StatCard
          title="Total Revenue"
          value={`${stats.total_revenue?.toFixed(2)} SOL`}
          icon={FiDollarSign}
          trend={growth?.revenue_growth_percentage}
          trendLabel="vs last 30 days"
          iconColor="text-green-400"
        />
        <StatCard
          title="Active Artists"
          value={stats.total_artists?.toLocaleString()}
          icon={FiMusic}
          trend={growth?.artists_growth_percentage}
          trendLabel="vs last 30 days"
          iconColor="text-purple-400"
        />
        <StatCard
          title="Total Content"
          value={stats.total_content?.toLocaleString()}
          icon={FiGrid}
          iconColor="text-pink-400"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pending_reports}
          icon={FiFlag}
          iconColor="text-red-400"
        />
        <StatCard
          title="Pending Verifications"
          value={stats.pending_verifications}
          icon={FiCheckCircle}
          iconColor="text-yellow-400"
        />
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Last 24 Hours</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{quickStats?.new_users_today}</div>
            <div className="text-sm text-gray-400">New Users</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{quickStats?.revenue_today?.toFixed(2)} SOL</div>
            <div className="text-sm text-gray-400">Revenue</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">
              {quickStats?.content_uploads_24h ? 
                (Object.values(quickStats.content_uploads_24h).reduce((a: any, b: any) => a + b, 0) as number) : 0
              }
            </div>
            <div className="text-sm text-gray-400">Content Uploads</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl font-bold text-white mb-1">{quickStats?.token_trades_24h}</div>
            <div className="text-sm text-gray-400">Token Trades</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity && <ActivityFeed activities={recentActivity} />}
    </div>
  );
}

// Users Section
function UsersSection({ usersData, refetchUsers }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleUserAction = async (userId: number, action: string, data?: any) => {
    try {
      await api.patch(`/admin/users/${userId}`, { action, ...data });
      toast.success('User updated successfully');
      refetchUsers();
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  const users = usersData?.data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="text-sm text-gray-400">{users.length} users</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or wallet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="artist">Artist</option>
          <option value="fan">Fan</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.email ? user.email[0].toUpperCase() : user.wallet_address?.[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {user.email || `${user.wallet_address?.slice(0, 4)}...${user.wallet_address?.slice(-4)}`}
                        </div>
                        {user.artist && (
                          <div className="text-xs text-gray-400">{user.artist.name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-900/30 text-red-400' :
                      user.role === 'artist' ? 'bg-purple-900/30 text-purple-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.banned ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400">
                        Banned
                      </span>
                    ) : user.suspended ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400">
                        Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onAction={handleUserAction}
        />
      )}
    </div>
  );
}

// Content Section
function ContentSection({ contentData, refetchContent }: any) {
  const [contentType, setContentType] = useState('all');

  const handleFeature = async (type: string, id: number) => {
    try {
      await api.post(`/admin/content/${type}/${id}/feature`);
      toast.success('Content featured');
      refetchContent();
    } catch (error) {
      toast.error('Failed to feature content');
    }
  };

  const handleRemove = async (type: string, id: number, reason: string) => {
    try {
      await api.delete(`/admin/content/${type}/${id}/remove`, { data: { reason } });
      toast.success('Content removed');
      refetchContent();
    } catch (error) {
      toast.error('Failed to remove content');
    }
  };

  const recentContent = contentData?.data?.recent || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Content Moderation</h2>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xl font-bold text-white">{contentData?.data?.albums || 0}</div>
          <div className="text-sm text-gray-400">Albums</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xl font-bold text-white">{contentData?.data?.tracks || 0}</div>
          <div className="text-sm text-gray-400">Tracks</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xl font-bold text-white">{contentData?.data?.videos || 0}</div>
          <div className="text-sm text-gray-400">Videos</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xl font-bold text-white">{contentData?.data?.minis || 0}</div>
          <div className="text-sm text-gray-400">Minis</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xl font-bold text-white">{contentData?.data?.livestreams || 0}</div>
          <div className="text-sm text-gray-400">Streams</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="text-xl font-bold text-white">{contentData?.data?.merch_items || 0}</div>
          <div className="text-sm text-gray-400">Merch</div>
        </div>
      </div>

      {/* Recent Content */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Recent Uploads</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
          {recentContent.map((item: any, index: number) => (
            <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-800/50">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                  <FiMusic className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.type} • {item.artist}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFeature(item.type.toLowerCase(), item.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                >
                  Feature
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Reason for removal:');
                    if (reason) handleRemove(item.type.toLowerCase(), item.id, reason);
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Verifications Section
function VerificationsSection() {
  const { data, refetch } = useQuery({
    queryKey: ['admin', 'verifications'],
    queryFn: async () => {
      const response = await api.get('/artists?verification_requested=true');
      return response.data;
    },
  });

  const handleApprove = async (artistId: number) => {
    try {
      await api.post(`/admin/verification/${artistId}/approve`);
      toast.success('Verification approved');
      refetch();
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (artistId: number) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    try {
      await api.post(`/admin/verification/${artistId}/reject`, { reason });
      toast.success('Verification rejected');
      refetch();
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Verification Requests</h2>
      
      <div className="space-y-4">
        {data?.artists?.map((artist: any) => (
          <div key={artist.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{artist.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Followers</div>
                    <div className="text-white font-semibold">{artist.followers_count}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Albums</div>
                    <div className="text-white font-semibold">{artist.albums_count}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Joined</div>
                    <div className="text-white font-semibold">
                      {new Date(artist.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleReject(artist.id)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(artist.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!data?.artists || data.artists.length === 0) && (
          <div className="text-center py-20 text-gray-400">
            <FiCheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            No pending verification requests
          </div>
        )}
      </div>
    </div>
  );
}

// Reports Section
function ReportsSection() {
  const { data, refetch } = useQuery({
    queryKey: ['admin', 'reports'],
    queryFn: () => api.get('/reports?status=pending'),
  });

  const handleResolve = async (reportId: number, action: string) => {
    try {
      await api.patch(`/reports/${reportId}`, { status: 'resolved', action });
      toast.success('Report resolved');
      refetch();
    } catch (error) {
      toast.error('Failed to resolve report');
    }
  };

  const reports = data?.data?.reports || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Reported Content</h2>
      
      <div className="space-y-4">
        {reports.map((report: any) => (
          <div key={report.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-900/30 text-red-400 text-xs font-semibold rounded">
                    {report.reportable_type}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {new Date(report.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-white mb-2">{report.reason}</p>
                <div className="text-sm text-gray-400">
                  Reported by: {report.reporter?.email || report.reporter?.wallet_address}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleResolve(report.id, 'no_action')}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleResolve(report.id, 'remove_content')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <FiFlag className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            No pending reports
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Section
function AnalyticsSection({ analyticsData }: any) {
  if (!analyticsData) return <div className="text-center py-20 text-gray-400">Loading analytics...</div>;

  const data = analyticsData.data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>

      {/* Top Artists */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Top Artists by Revenue</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Followers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.top_artists?.map((artist: any, index: number) => (
                <tr key={artist.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                      <span className="text-white font-medium">{artist.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white font-semibold">{artist.revenue?.toFixed(2)} SOL</td>
                  <td className="px-6 py-4 text-gray-400">{artist.followers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Content */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Top Content by Streams</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Track</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Artist</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Streams</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.top_content?.map((track: any, index: number) => (
                <tr key={track.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono text-sm">#{index + 1}</span>
                      <div>
                        <div className="text-white font-medium">{track.title}</div>
                        <div className="text-xs text-gray-400">{track.album}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{track.artist}</td>
                  <td className="px-6 py-4 text-white font-semibold">{track.streams?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Revenue Section
function RevenueSection({ revenueData }: any) {
  if (!revenueData) return <div className="text-center py-20 text-gray-400">Loading revenue data...</div>;

  const data = revenueData.data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Revenue Tracking</h2>

      {/* Total Revenue */}
      <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-800/30 rounded-xl p-6">
        <div className="text-sm text-gray-400 mb-2">Total Platform Revenue</div>
        <div className="text-4xl font-bold text-white mb-4">{data?.total_revenue?.toFixed(2)} SOL</div>
        
        {/* Revenue by Source */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-xs text-gray-400">Tickets</div>
            <div className="text-lg font-bold text-white">{data?.revenue_by_source?.tickets?.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Albums</div>
            <div className="text-lg font-bold text-white">{data?.revenue_by_source?.albums?.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Tokens</div>
            <div className="text-lg font-bold text-white">{data?.revenue_by_source?.tokens?.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Fan Passes</div>
            <div className="text-lg font-bold text-white">{data?.revenue_by_source?.fan_passes?.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Merch</div>
            <div className="text-lg font-bold text-white">{data?.revenue_by_source?.merch?.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-400 mb-2">Dev Fee (20%)</div>
          <div className="text-2xl font-bold text-blue-400">{data?.fee_breakdown?.dev_fee?.toFixed(2)} SOL</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-400 mb-2">Platform Fees</div>
          <div className="text-2xl font-bold text-purple-400">{data?.fee_breakdown?.platform_fee?.toFixed(2)} SOL</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="text-sm text-gray-400 mb-2">Artist Payouts (80%)</div>
          <div className="text-2xl font-bold text-green-400">{data?.fee_breakdown?.artist_payouts?.toFixed(2)} SOL</div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {data?.recent_transactions?.slice(0, 20).map((tx: any, index: number) => (
                <tr key={index} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 text-white">{tx.type}</td>
                  <td className="px-6 py-4 text-green-400 font-semibold">{tx.amount?.toFixed(2)} SOL</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{tx.user}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(tx.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// User Details Modal Component
function UserDetailsModal({ user, onClose, onAction }: any) {
  const [selectedAction, setSelectedAction] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (selectedAction === 'suspend' || selectedAction === 'ban') {
      if (!reason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
      onAction(user.id, selectedAction, { reason });
    } else {
      onAction(user.id, selectedAction);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">User Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-4 mb-6">
          <div>
            <div className="text-sm text-gray-400">Email</div>
            <div className="text-white">{user.email || 'Not connected'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Wallet</div>
            <div className="text-white font-mono text-sm">{user.wallet_address || 'Not connected'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Role</div>
            <div className="text-white capitalize">{user.role}</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Status</div>
            <div className="text-white">
              {user.banned ? (
                <span className="text-red-400">Banned - {user.ban_reason}</span>
              ) : user.suspended ? (
                <span className="text-yellow-400">Suspended - {user.suspension_reason}</span>
              ) : (
                <span className="text-green-400">Active</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select action...</option>
              {!user.suspended && !user.banned && <option value="suspend">Suspend User</option>}
              {!user.banned && <option value="ban">Ban User</option>}
              {user.suspended && <option value="unsuspend">Unsuspend User</option>}
              {user.banned && <option value="unban">Unban User</option>}
              <option value="change_role">Change Role</option>
            </select>
          </div>

          {(selectedAction === 'suspend' || selectedAction === 'ban') && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                rows={3}
                placeholder="Enter reason..."
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedAction}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
