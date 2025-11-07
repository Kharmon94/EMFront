'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer, usePlayerStore } from '@/components/MusicPlayer';
import { FiPlay, FiSearch, FiMusic, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

export default function MusicPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { playTrack } = usePlayerStore();

  const { data: albumsData, isLoading: albumsLoading } = useQuery({
    queryKey: ['albums', filter, searchQuery],
    queryFn: () => api.getAlbums({ 
      released: filter === 'released' ? 'true' : undefined,
      upcoming: filter === 'upcoming' ? 'true' : undefined,
      sort: filter === 'trending' ? 'streams' : undefined,
      q: searchQuery || undefined,
    }),
  });

  const albums = albumsData?.albums || [];

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 py-8">

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for artists, albums, or tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
            {['all', 'released', 'upcoming', 'trending'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Albums Grid */}
          {albumsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-800 rounded-lg mb-3" />
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {albums.map((album: any) => (
                <AlbumCard key={album.id} album={album} onPlayClick={playTrack} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiMusic className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No albums found</p>
            </div>
          )}
        </div>
      </main>
      
      <MusicPlayer />
    </>
  );
}

function AlbumCard({ album, onPlayClick }: { album: any; onPlayClick: (track: any, queue?: any[]) => void }) {
  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Fetch album tracks
      const response = await api.getAlbum(album.id);
      const tracks = response.tracks || [];
      
      if (tracks.length > 0) {
        // Play first track with full album as queue
        const firstTrack = {
          ...tracks[0],
          album: {
            id: album.id,
            title: album.title,
            cover_url: album.cover_url,
          },
          artist: album.artist,
        };
        
        const queue = tracks.map((t: any) => ({
          ...t,
          album: {
            id: album.id,
            title: album.title,
            cover_url: album.cover_url,
          },
          artist: album.artist,
        }));
        
        onPlayClick(firstTrack, queue);
      }
    } catch (error) {
      console.error('Failed to load album tracks:', error);
    }
  };
  
  return (
    <Link href={`/albums/${album.id}`} className="group">
      <div className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3">
        {album.cover_url ? (
          <img 
            src={album.cover_url} 
            alt={album.title}
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
            onClick={handlePlayClick}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center text-white shadow-lg transform hover:scale-105 transition-transform"
          >
            <FiPlay className="w-6 h-6 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Album Info */}
      <div>
        <h3 className="text-sm sm:text-base font-medium text-white truncate group-hover:text-purple-400 transition-colors">
          {album.title}
        </h3>
        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 mt-1">
          <span className="truncate">{album.artist.name}</span>
          {album.artist.verified && (
            <FiCheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />
          )}
        </div>
        {album.tracks_count && (
          <p className="text-xs text-gray-500 mt-1">
            {album.tracks_count} tracks
          </p>
        )}
      </div>
    </Link>
  );
}

