'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FiPlay, FiEye, FiHeart, FiTrendingUp, FiUsers, FiGlobe, FiLock, FiShare2, FiList } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FriendsActivity } from '@/components/discovery/FriendsActivity';
import { useGesture } from '@/lib/useGesture';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function MinisPage() {
  const [activeTab, setActiveTab] = useState<'foryou' | 'trending' | 'following' | 'recent'>('foryou');
  
  const { data: forYouData, refetch: refetchForYou } = useQuery({
    queryKey: ['minis-foryou'],
    queryFn: () => api.getMiniFeed(),
    enabled: activeTab === 'foryou'
  });

  const { data: trendingData, refetch: refetchTrending } = useQuery({
    queryKey: ['minis-trending'],
    queryFn: () => api.getTrendingMinis(),
    enabled: activeTab === 'trending'
  });

  const { data: followingData, refetch: refetchFollowing } = useQuery({
    queryKey: ['minis-following'],
    queryFn: () => api.get('/minis/following'),
    enabled: activeTab === 'following'
  });

  const { data: recentData, isLoading, refetch: refetchRecent } = useQuery({
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
        return followingData?.data?.minis || [];
      case 'recent':
        return recentData?.minis || [];
      default:
        return [];
    }
  };

  const minis = getMinis();

  // Pull to refresh
  const { isPulling, isRefreshing, progress } = usePullToRefresh({
    onRefresh: async () => {
      switch (activeTab) {
        case 'foryou': await refetchForYou(); break;
        case 'trending': await refetchTrending(); break;
        case 'following': await refetchFollowing(); break;
        case 'recent': await refetchRecent(); break;
      }
    },
    enabled: typeof window !== 'undefined' && window.innerWidth < 768
  });

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
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 pt-16 md:pt-24 pb-24 md:pb-6">
        {/* Pull to refresh indicator */}
        {(isPulling || isRefreshing) && (
          <div 
            className="fixed top-16 md:top-24 left-0 right-0 flex justify-center z-40 transition-all"
            style={{ transform: `translateY(${Math.min(progress * 60, 60)}px)` }}
          >
            <div className={`px-4 py-2 bg-purple-600 text-white rounded-full text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
              {isRefreshing ? '↻ Refreshing...' : progress >= 1 ? 'Release to refresh' : '↓ Pull to refresh'}
            </div>
          </div>
        )}
        
        <div className="max-w-[1800px] mx-auto px-4">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab('foryou')}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'foryou'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiPlay /> For You
                </button>
                <button
                  onClick={() => setActiveTab('trending')}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'trending'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiTrendingUp /> Trending
                </button>
                <button
                  onClick={() => setActiveTab('following')}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'following'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiUsers /> Following
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === 'recent'
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FiEye /> Recent
                </button>
              </div>

              {/* Gesture Hint (Mobile only, first time) */}
              <div className="md:hidden bg-purple-600/10 dark:bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>Tip:</strong> Swipe left to like, right to share, double-tap to favorite!
                </p>
              </div>

              {/* Minis Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[9/16] bg-gray-300 dark:bg-gray-800 rounded-lg mb-2" />
                      <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-3/4 mb-1" />
                      <div className="h-3 bg-gray-300 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : minis.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {minis.map((mini: any) => (
                    <MiniCard key={mini.id} mini={mini} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FiPlay className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No minis available</p>
                </div>
              )}
            </div>

            {/* Sidebar - Friends Activity (Desktop only) */}
            <div className="hidden xl:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FriendsActivity />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}

function MiniCard({ mini }: { mini: any }) {
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    try {
      await api.post(`/minis/${mini.id}/like`);
      setLiked(true);
      toast.success('Liked!', { duration: 1000 });
    } catch (error) {
      toast.error('Failed to like');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mini.title,
        text: `Check out this mini by ${mini.artist?.name}!`,
        url: window.location.origin + `/minis/${mini.id}`
      });
    } else {
      navigator.clipboard.writeText(window.location.origin + `/minis/${mini.id}`);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleSaveToPlaylist = () => {
    // TODO: Implement save to playlist modal
    toast('Save to playlist coming soon!');
  };

  // Mobile gestures
  const gestureHandlers = useGesture({
    onSwipeLeft: handleLike,
    onSwipeRight: handleShare,
    onDoubleTap: handleLike,
    onLongPress: handleSaveToPlaylist
  });

  return (
    <div
      className="group relative cursor-pointer"
      {...gestureHandlers}
    >
      <Link href={`/minis/${mini.id}`}>
        {/* Thumbnail */}
        <div className="aspect-[9/16] rounded-lg overflow-hidden bg-gray-700 relative">
          {mini.thumbnail_url ? (
            <img
              src={mini.thumbnail_url}
              alt={mini.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <FiPlay className="w-12 h-12 text-white" />
            </div>
          )}
          
          {/* Duration */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs rounded">
            {formatDuration(mini.duration)}
          </div>
          
          {/* Access Tier */}
          {mini.access_tier && mini.access_tier !== 'free' && (
            <div className="absolute top-2 right-2">
              {getAccessIcon(mini.access_tier)}
            </div>
          )}
          
          {/* Play Icon Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <FiPlay className="w-16 h-16 text-white" />
          </div>
        </div>
      </Link>
      
      {/* Info */}
      <div className="mt-2">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
          {mini.title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
          {mini.artist?.name}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-500">
          {mini.views_count > 0 && (
            <span className="flex items-center gap-1">
              <FiEye size={12} /> {formatCount(mini.views_count)}
            </span>
          )}
          {mini.likes_count > 0 && (
            <span className="flex items-center gap-1">
              <FiHeart size={12} /> {formatCount(mini.likes_count)}
            </span>
          )}
        </div>
      </div>
      
      {/* Quick Actions (Desktop) */}
      <div className="hidden md:flex absolute top-2 left-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleLike();
          }}
          className="p-2 rounded-full bg-black/80 hover:bg-red-600 text-white transition-colors"
        >
          <FiHeart className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleShare();
          }}
          className="p-2 rounded-full bg-black/80 hover:bg-blue-600 text-white transition-colors"
        >
          <FiShare2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSaveToPlaylist();
          }}
          className="p-2 rounded-full bg-black/80 hover:bg-purple-600 text-white transition-colors"
        >
          <FiList className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function getAccessIcon(accessTier: string) {
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
}

function formatCount(count: number) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
}
