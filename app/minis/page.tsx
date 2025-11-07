'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FiPlay, FiEye, FiHeart, FiTrendingUp, FiUsers, FiGlobe, FiLock } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';

export default function MinisPage() {
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'following' | 'recent'>('foryou');
  
  const { data: forYouData } = useQuery({
    queryKey: ['minis-foryou'],
    queryFn: () => api.getMiniFeed(),
    enabled: activeTab === 'foryou'
  });

  const { data: trendingData } = useQuery({
    queryKey: ['minis-trending'],
    queryFn: () => api.getTrendingMinis(),
    enabled: activeTab === 'trending'
  });

  const { data: followingData } = useQuery({
    queryKey: ['minis-following'],
    queryFn: () => api.getFollowingMinis(),
    enabled: activeTab === 'following'
  });

  const { data: recentData, isLoading } = useQuery({
    queryKey: ['minis-recent'],
    queryFn: () => api.getMinis({ sort: 'recent' }),
    enabled: activeTab === 'recent'
  });

  const getMinis = () => {
    switch (activeTab) {
      case 'foryou':
        return forYouData?.minis || [];
      case 'trending':
        return trendingData?.minis || [];
      case 'following':
        return followingData?.minis || [];
      case 'recent':
        return recentData?.minis || [];
      default:
        return [];
    }
  };

  const minis = getMinis();

  const getAccessIcon = (accessTier: string) => {
    switch (accessTier) {
      case 'free':
        return <FiGlobe className="text-green-500" size={16} />;
      case 'preview_only':
      case 'paid':
        return <span className="text-yellow-500 font-bold text-xs">{accessTier === 'paid' ? '💰' : '👀'}</span>;
      case 'nft_required':
        return <FiLock className="text-purple-500" size={16} />;
      default:
        return null;
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <Navigation />
      
      <div className="container mx-auto px-4 pt-1 md:pt-20 pb-8">

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('foryou')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'foryou'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <FiPlay /> For You
          </button>
          <button
            onClick={() => setActiveTab('trending')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'trending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <FiTrendingUp /> Trending
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'following'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <FiUsers /> Following
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'recent'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-800'
            }`}
          >
            <FiGlobe /> New
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading Mini's...</p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {minis.map((mini: any, index: number) => (
            <Link
              key={mini.id}
              href={`/minis/${mini.id}`}
              className="group relative aspect-[9/16] bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
            >
              {/* Thumbnail */}
              {mini.thumbnail_url ? (
                <img
                  src={mini.thumbnail_url}
                  alt={mini.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                  <FiPlay size={48} className="text-white/50" />
                </div>
              )}

              {/* Play overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-purple-500 rounded-full p-4">
                  <FiPlay size={32} className="text-white" />
                </div>
              </div>

              {/* Duration badge */}
              <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-semibold">
                {formatDuration(mini.duration)}
              </div>

              {/* Access tier badge */}
              <div className="absolute top-2 left-2 bg-black/80 p-1.5 rounded">
                {getAccessIcon(mini.access_tier)}
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                <div className="text-white">
                  <p className="font-semibold text-sm line-clamp-2 mb-2">{mini.title}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-white/80">
                    <div className="flex items-center gap-1">
                      <FiEye size={12} />
                      {formatCount(mini.views_count)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FiHeart size={12} />
                      {formatCount(mini.likes_count)}
                    </div>
                  </div>

                  {/* Artist */}
                  <div className="mt-2 flex items-center gap-1">
                    {mini.artist.avatar_url ? (
                      <img
                        src={mini.artist.avatar_url}
                        alt={mini.artist.name}
                        className="w-4 h-4 rounded-full"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-purple-600" />
                    )}
                    <span className="text-xs text-white/70 truncate">{mini.artist.name}</span>
                    {mini.artist.verified && <span className="text-blue-500 text-xs">✓</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {!isLoading && minis.length === 0 && (
          <div className="text-center py-20">
            <FiPlay size={64} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Mini's yet</h3>
            <p className="text-gray-400">
              {activeTab === 'following'
                ? 'Follow some artists to see their Minis here'
                : 'Check back soon for new content!'}
            </p>
          </div>
        )}
      </div>
      </div>
    </PermissionGuard>
  );
}

