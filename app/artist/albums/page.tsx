'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { FiMusic, FiPlus, FiEdit2, FiTrash2, FiEye, FiDollarSign, FiClock, FiHeadphones } from 'react-icons/fi';

export default function ArtistAlbumsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['artistAlbums'],
    queryFn: async () => {
      const user = await api.get('/auth/me');
      const artistId = user.data.user.artist.id;
      return api.get(`/artists/${artistId}/albums`);
    },
  });

  const handleDelete = async (albumId: number) => {
    if (!confirm('Are you sure you want to delete this album? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/albums/${albumId}`);
      toast.success('Album deleted successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete album');
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

  const albums = data?.data?.albums || [];

  return (
    <PermissionGuard require="artist" redirectTo="/">
      <Navigation />
      
      <div className="min-h-screen bg-white dark:bg-black pt-16 md:pt-24 pb-24 md:pb-6">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">My Albums</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your discography
              </p>
            </div>
            <Link
              href="/artist/albums/create"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Upload Album
            </Link>
          </div>

          {/* Albums Grid */}
          {albums.length === 0 ? (
            <div className="text-center py-16">
              <FiMusic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">No albums yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Upload your first album to get started</p>
              <Link
                href="/artist/albums/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Upload Album
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album: any) => (
                <div
                  key={album.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
                >
                  {/* Album Cover */}
                  <div className="relative aspect-square bg-white dark:bg-gray-800">
                    {album.cover_url ? (
                      <img
                        src={album.cover_url}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiMusic className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Release Status Badge */}
                    <div className="absolute top-2 right-2">
                      {new Date(album.release_date) > new Date() ? (
                        <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">
                          Upcoming
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                          Released
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Album Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-black dark:text-white mb-2 truncate">
                      {album.title}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <FiClock className="w-4 h-4" />
                        <span>{new Date(album.release_date).toLocaleDateString()}</span>
                      </div>
                      
                      {album.streams_count !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <FiHeadphones className="w-4 h-4" />
                          <span>{(album.streams_count || 0).toLocaleString()} streams</span>
                        </div>
                      )}
                      
                      {album.price && (
                        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                          <FiDollarSign className="w-4 h-4" />
                          <span>{album.price} SOL</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/artist/albums/${album.id}/tracks`}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
                      >
                        <FiEdit2 className="w-4 h-4 inline mr-1" />
                        Manage Tracks
                      </Link>
                      <Link
                        href={`/albums/${album.id}`}
                        className="px-3 py-2 bg-white dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-black dark:text-white rounded-lg transition-colors"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(album.id)}
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

