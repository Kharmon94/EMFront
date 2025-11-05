'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer, usePlayerStore } from '@/components/MusicPlayer';
import { FiSearch, FiMusic, FiUser, FiDisc, FiCheckCircle, FiPlay } from 'react-icons/fi';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'artists' | 'albums' | 'tracks'>('all');
  const { playTrack } = usePlayerStore();

  // Search all categories
  const { data: searchData, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query.trim()) return null;
      
      const [artists, albums, tracks] = await Promise.all([
        api.searchArtists(query).catch(() => ({ artists: [] })),
        api.getAlbums({ q: query }).catch(() => ({ albums: [] })),
        api.getTracks({ q: query }).catch(() => ({ tracks: [] })),
      ]);
      
      return {
        artists: artists.artists || [],
        albums: albums.albums || [],
        tracks: tracks.tracks || [],
      };
    },
    enabled: query.trim().length > 0,
  });

  const handlePlayTrack = async (track: any) => {
    const enrichedTrack = {
      ...track,
      album: track.album || {},
      artist: track.artist || {},
    };
    playTrack(enrichedTrack, [enrichedTrack]);
  };

  const hasResults = searchData && (
    searchData.artists.length > 0 ||
    searchData.albums.length > 0 ||
    searchData.tracks.length > 0
  );

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">Search</h1>
            
            {/* Search Input */}
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for artists, albums, or tracks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          {!query.trim() ? (
            <div className="text-center py-20">
              <FiSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Start typing to search</p>
            </div>
          ) : isLoading ? (
            <div className="text-center py-20">
              <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Searching...</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-20">
              <FiSearch className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No results found</p>
              <p className="text-gray-500 text-sm">
                Try different keywords or check your spelling
              </p>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex gap-4 mb-8 border-b border-gray-800 overflow-x-auto">
                {['all', 'artists', 'albums', 'tracks'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 px-2 font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'text-purple-500 border-b-2 border-purple-500'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {searchData && (
                      <span className="ml-2 text-xs">
                        ({tab === 'all' 
                          ? searchData.artists.length + searchData.albums.length + searchData.tracks.length
                          : searchData[tab + 's' as keyof typeof searchData]?.length || 0
                        })
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Results Sections */}
              <div className="space-y-8">
                {/* Artists */}
                {(activeTab === 'all' || activeTab === 'artists') && searchData.artists.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiUser className="w-5 h-5" />
                      Artists
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {searchData.artists.slice(0, activeTab === 'artists' ? undefined : 5).map((artist: any) => (
                        <Link key={artist.id} href={`/artists/${artist.id}`} className="group text-center">
                          <div className="aspect-square bg-gray-800 rounded-full overflow-hidden mb-3 mx-auto">
                            {artist.avatar_url ? (
                              <img 
                                src={artist.avatar_url} 
                                alt={artist.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                                <FiUser className="w-12 h-12 text-white/50" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors flex items-center justify-center gap-1">
                            {artist.name}
                            {artist.verified && <FiCheckCircle className="w-3 h-3 text-blue-500" />}
                          </h3>
                          <p className="text-xs text-gray-500">Artist</p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Albums */}
                {(activeTab === 'all' || activeTab === 'albums') && searchData.albums.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiDisc className="w-5 h-5" />
                      Albums
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {searchData.albums.slice(0, activeTab === 'albums' ? undefined : 5).map((album: any) => (
                        <Link key={album.id} href={`/albums/${album.id}`} className="group">
                          <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-3">
                            {album.cover_url ? (
                              <img 
                                src={album.cover_url} 
                                alt={album.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
                                <FiMusic className="w-12 h-12 text-white/50" />
                              </div>
                            )}
                          </div>
                          <h3 className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                            {album.title}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">
                            {album.artist?.name}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Tracks */}
                {(activeTab === 'all' || activeTab === 'tracks') && searchData.tracks.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <FiMusic className="w-5 h-5" />
                      Tracks
                    </h2>
                    <div className="space-y-1">
                      {searchData.tracks.slice(0, activeTab === 'tracks' ? undefined : 10).map((track: any) => (
                        <div
                          key={track.id}
                          className="group flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                          onClick={() => handlePlayTrack(track)}
                        >
                          {/* Cover */}
                          <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 relative">
                            {track.album?.cover_url ? (
                              <img 
                                src={track.album.cover_url} 
                                alt={track.album.title}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900 rounded">
                                <FiMusic className="w-5 h-5 text-white/50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <FiPlay className="w-5 h-5 text-white" />
                            </div>
                          </div>

                          {/* Track info */}
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {track.title}
                            </div>
                            <div className="text-sm text-gray-400 truncate">
                              {track.artist?.name}
                              {track.album && ` • ${track.album.title}`}
                            </div>
                          </div>

                          {/* Duration */}
                          {track.duration && (
                            <div className="text-sm text-gray-400">
                              {formatDuration(track.duration)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      
      <MusicPlayer />
    </>
  );
}

