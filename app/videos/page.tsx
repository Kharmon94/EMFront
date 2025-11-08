'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FiPlay, FiEye, FiHeart, FiClock, FiGlobe, FiLock, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Navigation } from '@/components/Navigation';
import { RecommendationSection } from '@/components/discovery/RecommendationSection';
import { FriendsActivity } from '@/components/discovery/FriendsActivity';
import api from '@/lib/api';

type Tab = 'for-you' | 'trending' | 'following' | 'recent';

export default function VideosPage() {
  const [activeTab, setActiveTab] = useState<Tab>('for-you');
  
  // For You Tab
  const { data: forYouData, isLoading: forYouLoading } = useQuery({
    queryKey: ['recommendations', 'videos'],
    queryFn: () => api.get('/recommendations/videos?limit=20'),
    enabled: activeTab === 'for-you'
  });

  // Trending Tab
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['videos', 'trending'],
    queryFn: () => api.getVideos({ sort: 'trending' }),
    enabled: activeTab === 'trending'
  });

  // Following Tab
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['videos', 'following'],
    queryFn: () => api.get('/videos?following=true'),
    enabled: activeTab === 'following'
  });

  // Recent Tab
  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ['videos', 'recent'],
    queryFn: () => api.getVideos({ sort: 'recent' }),
    enabled: activeTab === 'recent'
  });

  // Continue Watching
  const { data: continueWatchingData } = useQuery({
    queryKey: ['discovery', 'continue-watching'],
    queryFn: () => api.get('/discovery/continue_watching?limit=6')
  });

  const getVideos = () => {
    switch (activeTab) {
      case 'for-you': return forYouData?.data?.videos || [];
      case 'trending': return trendingData?.videos || [];
      case 'following': return followingData?.data?.videos || [];
      case 'recent': return recentData?.videos || [];
      default: return [];
    }
  };

  const videos = getVideos();
  const isLoading = forYouLoading || trendingLoading || followingLoading || recentLoading;
  const continueWatching = continueWatchingData?.data?.continue_watching?.filter((item: any) => item.type === 'video') || [];

  const tabs = [
    { id: 'for-you' as Tab, label: 'For You', icon: <FiHeart /> },
    { id: 'trending' as Tab, label: 'Trending', icon: <FiTrendingUp /> },
    { id: 'following' as Tab, label: 'Following', icon: <FiUsers /> },
    { id: 'recent' as Tab, label: 'Recent', icon: <FiClock /> },
  ];

  const getAccessIcon = (accessTier: string) => {
    switch (accessTier) {
      case 'free':
        return <FiGlobe className="text-green-500" />;
      case 'preview_only':
        return <FiEye className="text-yellow-500" />;
      case 'nft_required':
      case 'paid':
        return <FiLock className="text-purple-500" />;
      default:
        return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-[1800px] mx-auto px-4">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Continue Watching - Show on For You tab */}
            {activeTab === 'for-you' && continueWatching.length > 0 && (
              <RecommendationSection
                title="Continue Watching"
                subtitle="Pick up where you left off"
                icon={<FiPlay />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {continueWatching.map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/videos/${item.content.id}`}
                      className="group"
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-700 mb-3">
                        {item.content.thumbnail_url && (
                          <img
                            src={item.content.thumbnail_url}
                            alt={item.content.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                          <div
                            className="h-full bg-purple-600"
                            style={{ width: `${item.watch_percentage}%` }}
                          />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {item.content.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.watch_percentage}% watched
                      </p>
                    </Link>
                  ))}
                </div>
              </RecommendationSection>
            )}

            {/* Videos Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg mb-3" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video: any) => (
                  <Link
                    key={video.id}
                    href={`/videos/${video.id}`}
                    className="group bg-gray-100 dark:bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-700">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
                          <FiPlay className="w-12 h-12 text-white" />
                        </div>
                      )}
                      
                      {/* Duration */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                      
                      {/* Access Tier */}
                      {video.access_tier && (
                        <div className="absolute top-2 right-2">
                          {getAccessIcon(video.access_tier)}
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                        {video.artist?.name}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                        {video.views_count > 0 && (
                          <span>{formatCount(video.views_count)} views</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <FiPlay className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">No videos available</p>
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
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
