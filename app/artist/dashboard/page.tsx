'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  FiUsers, FiMusic, FiCalendar, FiVideo, FiShoppingBag, FiGift, 
  FiTrendingUp, FiDollarSign, FiPlus, FiUpload, FiRadio, FiFilm,
  FiClock, FiHeart, FiMessageCircle, FiPackage, FiActivity, FiUser
} from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function ArtistDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const checkArtistAccess = async () => {
      try {
        const response = await api.get('/auth/me');
        
        if (!isMounted) return;
        
        const currentUser = response.data.user;
        setUser(currentUser);

        if (currentUser.role !== 'artist') {
          toast.error('Artist access required');
          router.push('/');
        }
      } catch (error: any) {
        if (!isMounted) return;
        
        // Clear invalid token on 401
        if (error.response?.status === 401) {
          api.clearToken();
        }
        
        toast.error('Please sign in to access artist dashboard');
        router.push('/');
      }
    };

    checkArtistAccess();
    
    return () => {
      isMounted = false;
    };
  }, [router]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['artistDashboard'],
    queryFn: () => api.get('/artist/dashboard'),
    enabled: !!user && user.role === 'artist',
  });

  if (isLoading || !user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load dashboard</p>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  const { artist, stats, token, content_counts, recent_activity, upcoming_schedule } = data.data;

  const quickActions = [
    { 
      label: 'Upload Album', 
      icon: FiMusic, 
      href: '/artist/albums/create',
      color: 'blue'
    },
    { 
      label: 'Create Event', 
      icon: FiCalendar, 
      href: '/artist/events/create',
      color: 'green'
    },
    { 
      label: 'Start Livestream', 
      icon: FiRadio, 
      href: '/artist/livestreams/create',
      color: 'red'
    },
    { 
      label: 'Upload Video', 
      icon: FiVideo, 
      href: '/artist/videos/upload',
      color: 'purple'
    },
    { 
      label: 'Upload Mini', 
      icon: FiFilm, 
      href: '/artist/minis',
      color: 'pink'
    },
    { 
      label: 'Create Fan Pass', 
      icon: FiGift, 
      href: '/artist/fan-passes/create',
      color: 'yellow'
    },
  ];

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-600 to-blue-400',
      green: 'from-green-600 to-green-400',
      red: 'from-red-600 to-red-400',
      purple: 'from-purple-600 to-purple-400',
      pink: 'from-pink-600 to-pink-400',
      yellow: 'from-yellow-600 to-yellow-400',
    };
    return colors[color] || 'from-gray-600 to-gray-400';
  };

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />

      <div className="min-h-screen bg-white dark:bg-black pt-6 pb-24 md:pb-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                {artist.avatar_url && (
                  <img 
                    src={artist.avatar_url} 
                    alt={artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white">Welcome back, {artist.name}</h1>
                  {artist.verified && (
                    <span className="inline-flex items-center gap-1 text-sm text-blue-400">
                      <FiActivity className="w-4 h-4" />
                      Verified Artist
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/artists/${artist.id}`}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FiUser className="w-4 h-4" />
                Preview Profile
              </Link>
            </div>
            <p className="text-gray-400">Manage your content, track your performance, and grow your community.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FiUsers className="w-5 h-5 text-blue-400" />
                <span className="text-2xl font-bold text-white">{stats.followers_count.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-400">Followers</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FiActivity className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{stats.total_streams.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-400">Total Streams</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FiUsers className="w-5 h-5 text-purple-400" />
                <span className="text-2xl font-bold text-white">{stats.monthly_listeners.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-400">Monthly Listeners</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-2">
                <FiDollarSign className="w-5 h-5 text-green-400" />
                <span className="text-2xl font-bold text-white">{(Number(stats.total_revenue) || 0).toFixed(2)} SOL</span>
              </div>
              <p className="text-sm text-gray-400">Total Revenue</p>
              <p className="text-xs text-green-400 mt-1">+{(Number(stats.this_month_revenue) || 0).toFixed(2)} SOL this month</p>
            </div>
          </div>

          {/* Token Stats (if exists) */}
          {token && (
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">${token.symbol} Token</h3>
                  <p className="text-sm text-gray-400">Your artist token performance</p>
                </div>
                <Link 
                  href={`/tokens/${token.id}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Current Price</p>
                  <p className="text-lg font-bold text-white">{token.current_price.toFixed(6)} SOL</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(token.market_cap)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Holders</p>
                  <p className="text-lg font-bold text-white">{token.holders_count}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">24h Change</p>
                  <p className={`text-lg font-bold ${token.price_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.price_change_24h >= 0 ? '+' : ''}{token.price_change_24h}%
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      href={action.href}
                      className="group relative overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-6 transition-all hover:scale-105"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getColorClass(action.color)} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <action.icon className="w-8 h-8 text-gray-400 group-hover:text-white mb-3 transition-colors" />
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{action.label}</p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Content Summary */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Your Content</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FiMusic className="w-5 h-5 text-blue-400" />
                      <span className="text-2xl font-bold text-white">{content_counts.albums}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Albums</p>
                    <p className="text-xs text-gray-500">{content_counts.tracks} total tracks</p>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FiCalendar className="w-5 h-5 text-green-400" />
                      <span className="text-2xl font-bold text-white">{content_counts.upcoming_events}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Upcoming Events</p>
                    <p className="text-xs text-gray-500">{content_counts.events} total</p>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FiRadio className="w-5 h-5 text-red-400" />
                      <span className="text-2xl font-bold text-white">{content_counts.upcoming_livestreams}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Scheduled Streams</p>
                    <p className="text-xs text-gray-500">{content_counts.livestreams} total</p>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FiVideo className="w-5 h-5 text-purple-400" />
                      <span className="text-2xl font-bold text-white">{content_counts.videos}</span>
                    </div>
                    <p className="text-sm text-gray-400">Videos</p>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FiFilm className="w-5 h-5 text-pink-400" />
                      <span className="text-2xl font-bold text-white">{content_counts.minis}</span>
                    </div>
                    <p className="text-sm text-gray-400">Mini's</p>
                  </div>

                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <FiGift className="w-5 h-5 text-yellow-400" />
                      <span className="text-2xl font-bold text-white">{content_counts.fan_passes}</span>
                    </div>
                    <p className="text-sm text-gray-400">Active Fan Passes</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                  {recent_activity && recent_activity.length > 0 ? (
                    recent_activity.map((activity: any, index: number) => (
                      <div key={index} className="p-4 hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'purchase' ? 'bg-green-900/30' :
                            activity.type === 'follow' ? 'bg-blue-900/30' :
                            'bg-purple-900/30'
                          }`}>
                            {activity.type === 'purchase' ? <FiDollarSign className="w-5 h-5 text-green-400" /> :
                             activity.type === 'follow' ? <FiUsers className="w-5 h-5 text-blue-400" /> :
                             <FiMessageCircle className="w-5 h-5 text-purple-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {activity.user} • {new Date(activity.created_at).toLocaleString()}
                            </p>
                            {activity.amount && (
                              <p className="text-sm text-green-400 font-semibold mt-1">+{activity.amount} SOL</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <FiActivity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="space-y-8">
              {/* Upcoming Schedule */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Upcoming Schedule</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                  {upcoming_schedule && upcoming_schedule.length > 0 ? (
                    upcoming_schedule.map((item: any, index: number) => (
                      <Link
                        key={index}
                        href={`/${item.type === 'event' ? 'events' : 'livestreams'}/${item.id}`}
                        className="block p-4 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === 'event' ? 'bg-green-900/30' : 'bg-red-900/30'
                          }`}>
                            {item.type === 'event' ? 
                              <FiCalendar className="w-5 h-5 text-green-400" /> :
                              <FiRadio className="w-5 h-5 text-red-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{item.title}</p>
                            {item.venue && (
                              <p className="text-xs text-gray-500">{item.venue}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {new Date(item.time).toLocaleDateString()} at {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <FiClock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm mb-3">No upcoming events or streams</p>
                      <Link 
                        href="/artist/events/create"
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                      >
                        Schedule something
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Links */}
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Manage</h2>
                <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
                  <Link 
                    href="/artist/albums"
                    className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FiMusic className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white">My Albums</span>
                    </div>
                    <span className="text-sm text-gray-500">{content_counts.albums}</span>
                  </Link>
                  
                  <Link 
                    href="/artist/videos"
                    className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FiVideo className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white">My Videos</span>
                    </div>
                    <span className="text-sm text-gray-500">{content_counts.videos}</span>
                  </Link>
                  
                  <Link 
                    href="/artist/minis"
                    className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FiFilm className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white">My Mini's</span>
                    </div>
                    <span className="text-sm text-gray-500">{content_counts.minis}</span>
                  </Link>
                  
                  <Link 
                    href="/artist/livestreams"
                    className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FiRadio className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white">Livestreams</span>
                    </div>
                    <span className="text-sm text-gray-500">{content_counts.livestreams}</span>
                  </Link>
                  
                  <Link 
                    href="/artist/fan-passes"
                    className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FiGift className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white">Fan Passes</span>
                    </div>
                    <span className="text-sm text-gray-500">{content_counts.fan_passes}</span>
                  </Link>
                  
                  <Link 
                    href={`/artists/${artist.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FiUsers className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                      <span className="text-sm text-gray-300 group-hover:text-white">Public Profile</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}

