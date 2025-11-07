'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer } from '@/components/MusicPlayer';
import { PermissionGuard } from '@/components/PermissionGuard';
import { FiMusic, FiPlus, FiPlay, FiLock, FiGlobe, FiClock } from 'react-icons/fi';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PlaylistsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: playlistsData, isLoading, refetch } = useQuery({
    queryKey: ['my-playlists'],
    queryFn: () => api.getUserPlaylists(),
  });

  const playlists = playlistsData?.playlists || [];

  const handleCreatePlaylist = () => {
    // TODO: Implement with actual authentication check
    toast.error('Please connect your wallet to create playlists');
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 py-8">
          {/* Create Playlist Button */}
          <div className="flex items-center justify-end mb-8">
            <button
              onClick={handleCreatePlaylist}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span className="hidden sm:inline">New Playlist</span>
            </button>
          </div>

          {/* Playlists Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-800 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : playlists.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {playlists.map((playlist: any) => (
                <PlaylistCard key={playlist.id} playlist={playlist} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiMusic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No playlists yet</p>
              <p className="text-gray-500 text-sm mb-6">
                Create your first playlist to start organizing your favorite tracks
              </p>
              <button
                onClick={handleCreatePlaylist}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Create Playlist
              </button>
            </div>
          )}
        </div>
      </main>
      
      <MusicPlayer />
    </PermissionGuard>
  );
}

function PlaylistCard({ playlist }: { playlist: any }) {
  const coverUrl = playlist.cover_url || (playlist.tracks?.[0]?.album?.cover_url);

  return (
    <Link href={`/playlists/${playlist.id}`} className="group">
      <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3">
        {coverUrl ? (
          <img 
            src={coverUrl} 
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
            <FiMusic className="w-12 h-12 text-white/50" />
          </div>
        )}
        
        {/* Play button on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-transform"
            onClick={(e) => {
              e.preventDefault();
              toast('Playlist playback coming soon!', { icon: 'ℹ️' });
            }}
          >
            <FiPlay className="w-6 h-6 ml-0.5" />
          </button>
        </div>

        {/* Privacy badge */}
        <div className="absolute top-2 right-2">
          {playlist.is_public ? (
            <div className="p-1.5 bg-black/60 rounded-full text-gray-300" title="Public">
              <FiGlobe className="w-3 h-3" />
            </div>
          ) : (
            <div className="p-1.5 bg-black/60 rounded-full text-gray-300" title="Private">
              <FiLock className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* Playlist Info */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-white truncate group-hover:text-purple-400 transition-colors">
          {playlist.name}
        </h3>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 mt-1">
          <span>{playlist.tracks_count || 0} tracks</span>
          {playlist.total_duration && (
            <>
              <span>•</span>
              <FiClock className="w-3 h-3" />
              <span>{formatDuration(playlist.total_duration)}</span>
            </>
          )}
        </div>
        {playlist.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {playlist.description}
          </p>
        )}
      </div>
    </Link>
  );
}

