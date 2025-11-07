'use client';

import { useEffect, useState } from 'react';
import { FiCalendar, FiMusic, FiDisc } from 'react-icons/fi';
import { UpcomingReleaseCard } from '@/components/UpcomingReleaseCard';
import api from '@/lib/api';

export const dynamic = 'force-dynamic';

interface UpcomingRelease {
  type: 'album' | 'track';
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  release_date: string;
  cover_url?: string;
  description?: string;
}

export default function UpcomingReleasesPage() {
  const [releases, setReleases] = useState<UpcomingRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'albums' | 'tracks'>('all');

  useEffect(() => {
    fetchUpcomingReleases();
  }, []);

  const fetchUpcomingReleases = async () => {
    setLoading(true);
    try {
      // Fetch upcoming albums
      const albumsResponse = await api.get('/albums', {
        params: {
          upcoming: true,
          sort: 'release_date'
        }
      });

      // Fetch upcoming tracks (singles)
      const tracksResponse = await api.get('/tracks', {
        params: {
          upcoming: true,
          sort: 'release_date'
        }
      });

      const upcomingAlbums = (albumsResponse.data.albums || []).map((album: any) => ({
        type: 'album' as const,
        id: album.id,
        title: album.title,
        artist: album.artist,
        release_date: album.release_date,
        cover_url: album.cover_url,
        description: album.description
      }));

      const upcomingTracks = (tracksResponse.data.tracks || []).map((track: any) => ({
        type: 'track' as const,
        id: track.id,
        title: track.title,
        artist: track.album?.artist || track.artist,
        release_date: track.release_date,
        cover_url: track.album?.cover_url,
        description: track.description
      }));

      // Combine and sort by release date
      const combined = [...upcomingAlbums, ...upcomingTracks].sort((a, b) => 
        new Date(a.release_date).getTime() - new Date(b.release_date).getTime()
      );

      setReleases(combined);
    } catch (error) {
      console.error('Failed to fetch upcoming releases:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReleases = releases.filter(release => {
    if (filter === 'all') return true;
    return release.type === filter.slice(0, -1); // 'albums' -> 'album'
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-14 md:pt-0">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiCalendar className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Upcoming Releases
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Pre-save new music and get notified when it drops
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('albums')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filter === 'albums'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FiDisc className="w-4 h-4" />
            Albums
          </button>
          <button
            onClick={() => setFilter('tracks')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              filter === 'tracks'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <FiMusic className="w-4 h-4" />
            Singles
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Releases Grid */}
        {!loading && filteredReleases.length > 0 && (
          <div className="grid gap-4">
            {filteredReleases.map((release) => (
              <UpcomingReleaseCard
                key={`${release.type}-${release.id}`}
                type={release.type}
                id={release.id}
                title={release.title}
                artist={release.artist}
                releaseDate={release.release_date}
                coverUrl={release.cover_url}
                description={release.description}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredReleases.length === 0 && (
          <div className="text-center py-20">
            <FiCalendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No upcoming releases
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Check back soon for new music announcements!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

