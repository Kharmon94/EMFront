'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { RecommendationSection } from '@/components/discovery/RecommendationSection';
import { FriendsActivity } from '@/components/discovery/FriendsActivity';
import { FiList, FiPlus, FiPlay, FiMusic, FiUsers, FiHeart, FiCompass } from 'react-icons/fi';
import toast from 'react-hot-toast';

type Tab = 'your-playlists' | 'collaborative' | 'discover' | 'community';

export default function PlaylistsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('your-playlists');

  // Your Playlists
  const { data: yourPlaylistsData, isLoading: yourLoading, refetch } = useQuery({
    queryKey: ['playlists'],
    queryFn: () => api.get('/playlists'),
    enabled: activeTab === 'your-playlists'
  });

  // Collaborative Playlists
  const { data: collaborativeData, isLoading: collaborativeLoading } = useQuery({
    queryKey: ['playlists', 'collaborative'],
    queryFn: () => api.get('/playlists/collaborative'),
    enabled: activeTab === 'collaborative'
  });

  // Discover Playlists
  const { data: discoverData, isLoading: discoverLoading } = useQuery({
    queryKey: ['playlists', 'discover'],
    queryFn: () => api.get('/playlists/discover'),
    enabled: activeTab === 'discover'
  });

  // Community Playlists
  const { data: communityData, isLoading: communityLoading } = useQuery({
    queryKey: ['playlists', 'community'],
    queryFn: () => api.get('/playlists/community'),
    enabled: activeTab === 'community'
  });

  const getPlaylists = () => {
    switch (activeTab) {
      case 'your-playlists': return yourPlaylistsData?.data?.playlists || [];
      case 'collaborative': return collaborativeData?.data?.playlists || [];
      case 'discover': return [...(discoverData?.data?.genre_playlists || []), ...(discoverData?.data?.curator_playlists || [])];
      case 'community': return communityData?.data?.playlists || [];
      default: return [];
    }
  };

  const playlists = getPlaylists();
  const isLoading = yourLoading || collaborativeLoading || discoverLoading || communityLoading;

  const handleCreatePlaylist = async () => {
    const title = prompt('Enter playlist name:');
    if (!title) return;

    try {
      await api.post('/playlists', { playlist: { title, is_public: false } });
      toast.success('Playlist created!');
      refetch();
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const tabs = [
    { id: 'your-playlists' as Tab, label: 'Your Playlists', icon: <FiList /> },
    { id: 'collaborative' as Tab, label: 'Collaborative', icon: <FiUsers /> },
    { id: 'discover' as Tab, label: 'Discover', icon: <FiCompass /> },
    { id: 'community' as Tab, label: 'Community', icon: <FiHeart /> },
  ];

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Playlists</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Organize and discover music</p>
                </div>
                {activeTab === 'your-playlists' && (
                  <button
                    onClick={handleCreatePlaylist}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FiPlus /> New Playlist
                  </button>
                )}
              </div>

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

              {/* Playlists Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-300 dark:bg-gray-800 rounded-lg mb-3" />
                      <div className="h-4 bg-gray-300 dark:bg-gray-800 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-300 dark:bg-gray-800 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : playlists.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {playlists.map((playlist: any) => (
                    <Link
                      key={playlist.id}
                      href={`/playlists/${playlist.id}`}
                      className="group"
                    >
                      {/* Playlist Cover */}
                      <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 mb-3 flex items-center justify-center relative group-hover:shadow-xl group-hover:shadow-purple-600/30 transition-all">
                        <FiMusic className="w-16 h-16 text-white opacity-50" />
                        
                        {/* Play overlay on hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                            <FiPlay className="w-6 h-6 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {playlist.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {playlist.tracks_count || 0} tracks
                        {playlist.collaborative && <span className="ml-2">• Collaborative</span>}
                      </p>
                      {playlist.followers_count > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {playlist.followers_count} followers
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FiList className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    {activeTab === 'your-playlists' ? 'No playlists yet' : 'No playlists found'}
                  </p>
                  {activeTab === 'your-playlists' && (
                    <button
                      onClick={handleCreatePlaylist}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Create Your First Playlist
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
    </PermissionGuard>
  );
}
