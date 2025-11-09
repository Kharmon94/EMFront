'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer, usePlayerStore } from '@/components/MusicPlayer';
import { RecommendationSection } from '@/components/discovery/RecommendationSection';
import { ContentCard } from '@/components/discovery/ContentCard';
import { FriendsActivity } from '@/components/discovery/FriendsActivity';
import { FiPlay, FiSearch, FiMusic, FiCheckCircle, FiTrendingUp, FiUsers, FiClock, FiHeart } from 'react-icons/fi';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

type Tab = 'for-you' | 'following' | 'trending' | 'new-releases' | 'all';

export default function MusicPage() {
  const [activeTab, setActiveTab] = useState<Tab>('for-you');
  const [searchQuery, setSearchQuery] = useState('');
  const { playTrack } = usePlayerStore();

  // For You Tab
  const { data: forYouData, isLoading: forYouLoading } = useQuery({
    queryKey: ['recommendations', 'albums'],
    queryFn: () => api.get('/recommendations/albums?limit=30'),
    enabled: activeTab === 'for-you'
  });

  // Following Tab  
  const { data: followingData, isLoading: followingLoading } = useQuery({
    queryKey: ['albums', 'following'],
    queryFn: () => api.get('/albums?following=true&limit=30'),
    enabled: activeTab === 'following'
  });

  // Trending Tab
  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['albums', 'trending'],
    queryFn: () => api.get('/albums?sort=popular&limit=30'),
    enabled: activeTab === 'trending'
  });

  // New Releases Tab
  const { data: newReleasesData, isLoading: newReleasesLoading } = useQuery({
    queryKey: ['albums', 'new-releases'],
    queryFn: () => api.get('/albums?sort=release_date&from_date=' + new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    enabled: activeTab === 'new-releases'
  });

  // All Albums
  const { data: albumsData, isLoading: albumsLoading } = useQuery({
    queryKey: ['albums', searchQuery],
    queryFn: () => api.getAlbums({ q: searchQuery || undefined }),
    enabled: activeTab === 'all'
  });

  // Recently Played
  const { data: recentlyPlayedData } = useQuery({
    queryKey: ['discovery', 'recently-played'],
    queryFn: () => api.get('/discovery/recently_played?limit=10')
  });

  const getAlbums = () => {
    switch (activeTab) {
      case 'for-you': return forYouData?.data?.albums || [];
      case 'following': return followingData?.data?.albums || [];
      case 'trending': return trendingData?.data?.albums || [];
      case 'new-releases': return newReleasesData?.data?.albums || [];
      case 'all': return albumsData?.albums || [];
      default: return [];
    }
  };

  const isLoading = forYouLoading || followingLoading || trendingLoading || newReleasesLoading || albumsLoading;
  const albums = getAlbums();
  const recentlyPlayed = recentlyPlayedData?.data?.recently_played || [];

  const tabs = [
    { id: 'for-you' as Tab, label: 'For You', icon: <FiHeart /> },
    { id: 'following' as Tab, label: 'Following', icon: <FiUsers /> },
    { id: 'trending' as Tab, label: 'Trending', icon: <FiTrendingUp /> },
    { id: 'new-releases' as Tab, label: 'New Releases', icon: <FiClock /> },
    { id: 'all' as Tab, label: 'All Albums', icon: <FiMusic /> },
  ];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-32 md:pb-28">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                  Music
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Discover your next favorite album
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="w-full sm:w-auto sm:min-w-[320px] lg:min-w-[400px]">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search albums, artists, tracks..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveTab('all');
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:text-gray-900 dark:hover:text-white hover:shadow-md'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Recently Played - Show on For You tab */}
              {activeTab === 'for-you' && recentlyPlayed.length > 0 && (
                <div className="mb-10">
                  <RecommendationSection
                    title="Continue Listening"
                    subtitle="Pick up where you left off"
                    icon={<FiPlay />}
                  >
                    <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide">
                      {recentlyPlayed.map((item: any) => (
                        <div key={item.id} className="flex-shrink-0 w-44 sm:w-52">
                          <ContentCard
                            item={item.content}
                            type={item.type}
                            onPlay={(content) => {
                              if (content.tracks) {
                                playTrack(content.tracks[0], content.tracks);
                              }
                            }}
                            showArtist={true}
                          />
                        </div>
                      ))}
                    </div>
                  </RecommendationSection>
                </div>
              )}

              {/* Albums Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl mb-3" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded-lg w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : albums.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {activeTab === 'for-you' && 'Recommended for You'}
                      {activeTab === 'following' && 'From Artists You Follow'}
                      {activeTab === 'trending' && 'Trending Albums'}
                      {activeTab === 'new-releases' && 'New Releases'}
                      {activeTab === 'all' && (searchQuery ? `Results for "${searchQuery}"` : 'All Albums')}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      {albums.length} album{albums.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                    {albums.map((album: any) => (
                      <div
                        key={album.id}
                        className="group relative"
                      >
                        <ContentCard
                          item={album}
                          type="album"
                          onPlay={async (album) => {
                            // Fetch album tracks and play first one
                            try {
                              const response = await api.get(`/albums/${album.id}`);
                              const tracks = response.data.tracks || [];
                              if (tracks.length > 0) {
                                playTrack(tracks[0], tracks);
                                toast.success(`Playing ${album.title}`);
                              }
                            } catch (error) {
                              console.error('Failed to load album tracks:', error);
                              toast.error('Failed to play album');
                            }
                          }}
                          showArtist={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 sm:py-32">
                  <div className="relative inline-block">
                    <FiMusic className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-2xl rounded-full" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {searchQuery ? 'No albums found' : 'No albums available'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search or browse all albums' 
                      : 'Check back soon for new releases'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setActiveTab('for-you');
                      }}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
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
      
      <MusicPlayer />
    </>
  );
}
