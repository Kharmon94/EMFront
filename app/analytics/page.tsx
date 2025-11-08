'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiMusic, FiVideo, FiHeart, FiMessageCircle, FiTrendingUp, FiCalendar, FiClock } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';

type Timeframe = 'last_7_days' | 'last_30_days' | 'this_year' | 'all_time';

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('last_30_days');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', 'stats', timeframe],
    queryFn: () => api.get(`/analytics/stats?timeframe=${timeframe}`)
  });

  const stats = data?.data?.stats || {};

  const timeframes: { id: Timeframe; label: string }[] = [
    { id: 'last_7_days', label: 'Last 7 Days' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'this_year', label: 'This Year' },
    { id: 'all_time', label: 'All Time' },
  ];

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Stats</h1>
            <p className="text-gray-600 dark:text-gray-400">
              See your listening history and engagement
            </p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {timeframes.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  timeframe === tf.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg p-6 h-32" />
              ))}
            </div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                  icon={<FiClock className="w-6 h-6" />}
                  label="Listening Time"
                  value={formatTime(stats.total_time || 0)}
                  color="purple"
                />
                <StatCard
                  icon={<FiMusic className="w-6 h-6" />}
                  label="Tracks Played"
                  value={(stats.total_tracks || 0).toString()}
                  color="blue"
                />
                <StatCard
                  icon={<FiVideo className="w-6 h-6" />}
                  label="Videos Watched"
                  value={(stats.total_videos || 0).toString()}
                  color="green"
                />
                <StatCard
                  icon={<FiHeart className="w-6 h-6" />}
                  label="Likes Given"
                  value={(stats.likes_given || 0).toString()}
                  color="red"
                />
              </div>

              {/* Top Artists */}
              {stats.top_artists && stats.top_artists.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Artists</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.top_artists.slice(0, 6).map((artist: any, index: number) => (
                      <Link
                        key={artist.id}
                        href={`/artists/${artist.id}`}
                        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="text-2xl font-bold text-purple-600">#{index + 1}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{artist.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {artist.play_count} plays • {formatTime(artist.total_time)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Tracks */}
              {stats.top_tracks && stats.top_tracks.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Top Tracks</h2>
                  <div className="space-y-2">
                    {stats.top_tracks.slice(0, 10).map((track: any, index: number) => (
                      <Link
                        key={track.id}
                        href={`/tracks/${track.id}`}
                        className="flex items-center gap-4 p-3 bg-gray-100 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="w-8 text-center font-bold text-gray-500">#{index + 1}</div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{track.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {track.play_count} plays
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Wrapped Link */}
              <div className="text-center py-12 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-red-600/10 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Ready for your Wrapped?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  See your personalized year-end summary
                </p>
                <Link
                  href="/wrapped"
                  className="inline-block px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  View Wrapped
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </PermissionGuard>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorClasses = {
    purple: 'bg-purple-600/10 dark:bg-purple-600/20 text-purple-600',
    blue: 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600',
    green: 'bg-green-600/10 dark:bg-green-600/20 text-green-600',
    red: 'bg-red-600/10 dark:bg-red-600/20 text-red-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className={`inline-flex p-3 rounded-lg mb-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

