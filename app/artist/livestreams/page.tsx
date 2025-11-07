'use client';

import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FiRadio, FiPlus, FiEdit2, FiTrash2, FiEye, FiClock, FiUsers } from 'react-icons/fi';

export default function ArtistLivestreamsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['artistLivestreams'],
    queryFn: async () => {
      const user = await api.get('/auth/me');
      const artistId = user.data.user.artist.id;
      return api.get(`/artists/${artistId}/livestreams`);
    },
  });

  const handleDelete = async (livestreamId: number) => {
    if (!confirm('Are you sure you want to cancel this livestream?')) {
      return;
    }

    try {
      await api.delete(`/livestreams/${livestreamId}`);
      toast.success('Livestream cancelled successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cancel livestream');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const livestreams = data?.data?.livestreams || [];

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-6 pb-24 md:pb-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">My Livestreams</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your live performances
              </p>
            </div>
            <Link
              href="/artist/livestreams/create"
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Schedule Livestream
            </Link>
          </div>

          {/* Livestreams List */}
          {livestreams.length === 0 ? (
            <div className="text-center py-16">
              <FiRadio className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No livestreams yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Schedule your first livestream to connect with fans</p>
              <Link
                href="/artist/livestreams/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Schedule Livestream
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livestreams.map((stream: any) => (
                <div
                  key={stream.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-red-500 dark:hover:border-red-500 transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-800">
                    {stream.thumbnail_url ? (
                      <img
                        src={stream.thumbnail_url}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiRadio className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      {stream.status === 'live' ? (
                        <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse flex items-center gap-1">
                          <span className="w-2 h-2 bg-white rounded-full" />
                          LIVE
                        </span>
                      ) : stream.status === 'scheduled' ? (
                        <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          Scheduled
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full">
                          Ended
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stream Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2 line-clamp-2">
                      {stream.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiClock className="w-4 h-4" />
                        <span>{new Date(stream.start_time).toLocaleString()}</span>
                      </div>
                      
                      {stream.viewers_count !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiUsers className="w-4 h-4" />
                          <span>{stream.viewers_count} viewers</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/artist/livestreams/${stream.id}`}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        <FiEdit2 className="w-4 h-4 inline mr-1" />
                        Manage
                      </Link>
                      <Link
                        href={`/livestreams/${stream.id}`}
                        className="px-3 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(stream.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}

