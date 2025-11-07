'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiVideo, FiUsers, FiClock, FiHeart, FiTrendingUp } from 'react-icons/fi';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { RecommendationSection } from '@/components/discovery/RecommendationSection';
import { FriendsActivity } from '@/components/discovery/FriendsActivity';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type Tab = 'live' | 'for-you' | 'upcoming' | 'following';

export default function LivestreamsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('live');

  // Live Streams
  const { data: liveData, isLoading: liveLoading } = useQuery({
    queryKey: ['livestreams', 'live'],
    queryFn: () => api.getLivestreams({ active: true }),
    refetchInterval: 10000,
    enabled: activeTab === 'live'
  });

  // For You (Recommended)
  const { data: forYouData, isLoading: forYouLoading } = useQuery({
    queryKey: ['recommendations', 'livestreams'],
    queryFn: () => api.get('/recommendations/livestreams?limit=15'),
    enabled: activeTab === 'for-you'
  });

  // Upcoming Streams
  const { data: upcomingData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['livestreams', 'upcoming'],
    queryFn: () => api.getLivestreams({ upcoming: true }),
    enabled: activeTab === 'upcoming'
  });

  // Following
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['livestreams', 'following'],
    queryFn: () => api.get('/livestreams?following=true'),
    enabled: activeTab === 'following'
  });

  // Friends watching
  const { data: friendsData } = useQuery({
    queryKey: ['discovery', 'friends-watching'],
    queryFn: () => api.get('/discovery/friends_activity?type=livestream'),
    refetchInterval: 30000
  });

  const getStreams = () => {
    switch (activeTab) {
      case 'live': return liveData?.livestreams || [];
      case 'for-you': return forYouData?.data?.livestreams || [];
      case 'upcoming': return upcomingData?.livestreams || [];
      case 'following': return followingData?.data?.livestreams || [];
      default: return [];
    }
  };

  const streams = getStreams();
  const isLoading = liveLoading || forYouLoading || upcomingLoading || followingLoading;
  const friendsWatching = friendsData?.data?.activities?.filter((a: any) => a.type === 'watching') || [];

  const tabs = [
    { id: 'live' as Tab, label: 'Live Now', icon: <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse" /> },
    { id: 'for-you' as Tab, label: 'For You', icon: <FiHeart /> },
    { id: 'upcoming' as Tab, label: 'Upcoming', icon: <FiClock /> },
    { id: 'following' as Tab, label: 'Following', icon: <FiUsers /> },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6 px-4">
        <div className="max-w-[1800px] mx-auto">
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
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Friends Watching Banner (on Live tab) */}
              {activeTab === 'live' && friendsWatching.length > 0 && (
                <div className="bg-purple-600/10 dark:bg-purple-600/20 border border-purple-600/30 rounded-lg p-4 mb-8">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUsers className="w-5 h-5 text-purple-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Friends Watching Now</h3>
                  </div>
                  <div className="flex gap-4 overflow-x-auto">
                    {friendsWatching.map((activity: any, index: number) => (
                      <div key={index} className="flex-shrink-0 text-sm text-gray-700 dark:text-gray-300">
                        {activity.friend?.email} is watching <span className="font-medium">{activity.content?.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Livestreams Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-video bg-gray-300 dark:bg-gray-900 rounded-lg mb-3" />
                      <div className="h-5 bg-gray-300 dark:bg-gray-900 rounded w-3/4 mb-2" />
                      <div className="h-4 bg-gray-300 dark:bg-gray-900 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : streams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streams.map((stream: any) => (
                    <LivestreamCard key={stream.id} stream={stream} isLive={activeTab === 'live'} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FiVideo className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No livestreams available</h3>
                  <p className="text-gray-600 dark:text-gray-400">Check back later for live performances!</p>
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
    </>
  );
}

function LivestreamCard({ stream, isLive }: { stream: any; isLive: boolean }) {
  return (
    <Link href={`/livestreams/${stream.id}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-800 hover:border-purple-600 dark:hover:border-purple-600 transition-all group">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-700">
          {stream.thumbnail_url ? (
            <img
              src={stream.thumbnail_url}
              alt={stream.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <FiVideo className="w-12 h-12 text-white opacity-50" />
            </div>
          )}
          
          {/* Live Badge */}
          {isLive && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              LIVE
            </div>
          )}
          
          {/* Viewer Count */}
          {stream.viewer_count > 0 && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs rounded flex items-center gap-1">
              <FiUsers className="w-3 h-3" />
              {formatCount(stream.viewer_count)}
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {stream.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {stream.artist?.name}
          </p>
          {!isLive && stream.start_time && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
              <FiClock className="w-3 h-3" />
              {new Date(stream.start_time).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
