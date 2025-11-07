'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tantml:invoke>
<parameter name="name">react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { MusicPlayer, usePlayerStore } from '@/components/MusicPlayer';
import { PermissionGuard } from '@/components/PermissionGuard';
import { 
  FiPlay, FiPause, FiHeart, FiShare2, FiEdit, FiTrash2, FiMoreVertical,
  FiClock, FiMusic, FiUser, FiUsers, FiLock, FiGlobe, FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatDuration } from '@/lib/utils';

export default function PlaylistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;
  const queryClient = useQueryClient();
  const { playTrack, isPlaying, currentTrack } = usePlayerStore();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '', is_public: true });

  const { data, isLoading } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => api.get(`/playlists/${playlistId}`).then(res => res.data)
  });

  const deletePlaylistMutation = useMutation({
    mutationFn: () => api.delete(`/playlists/${playlistId}`),
    onSuccess: () => {
      toast.success('Playlist deleted');
      router.push('/playlists');
    },
    onError: () => toast.error('Failed to delete playlist')
  });

  const updatePlaylistMutation = useMutation({
    mutationFn: (data: any) => api.patch(`/playlists/${playlistId}`, { playlist: data }),
    onSuccess: () => {
      toast.success('Playlist updated');
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
    },
    onError: () => toast.error('Failed to update playlist')
  });

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: number) => api.delete(`/playlists/${playlistId}/tracks/${trackId}`),
    onSuccess: () => {
      toast.success('Track removed');
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
    },
    onError: () => toast.error('Failed to remove track')
  });

  const likePlaylistMutation = useMutation({
    mutationFn: () => api.post(`/playlists/${playlistId}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
    }
  });

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  const playlist = data?.playlist;
  if (!playlist) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">Playlist not found</div>
        </div>
      </>
    );
  }

  const tracks = playlist.playlist_tracks || [];
  const totalDuration = tracks.reduce((sum: number, pt: any) => sum + (pt.track?.duration || 0), 0);
  const isOwner = data?.is_owner;

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      playTrack(tracks[0].track);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Playlist link copied!');
  };

  const handleEditSave = () => {
    updatePlaylistMutation.mutate(editData);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this playlist? This cannot be undone.')) {
      deletePlaylistMutation.mutate();
    }
  };

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-purple-900/10 dark:to-black pb-32">
        {/* Header */}
        <div className="relative bg-gradient-to-b from-purple-900/20 to-transparent">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
            <div className="flex flex-col md:flex-row gap-8 items-end">
              {/* Playlist Artwork */}
              <div className="w-full md:w-64 aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0">
                {playlist.custom_cover_url ? (
                  <img src={playlist.custom_cover_url} alt={playlist.title} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <FiMusic className="w-24 h-24 text-white/50" />
                )}
              </div>

              {/* Playlist Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {playlist.is_public ? (
                    <FiGlobe className="w-4 h-4 text-green-400" />
                  ) : (
                    <FiLock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-semibold text-gray-400 uppercase">
                    {playlist.collaborative ? 'Collaborative Playlist' : 'Playlist'}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
                  {playlist.title}
                </h1>
                
                {playlist.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-2xl">
                    {playlist.description}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
                  <Link href={`/users/${playlist.user?.id}`} className="flex items-center gap-1 hover:text-purple-600">
                    <FiUser className="w-4 h-4" />
                    <span className="font-semibold">{playlist.user?.email?.split('@')[0] || 'User'}</span>
                  </Link>
                  <span>•</span>
                  <span>{tracks.length} songs</span>
                  {tracks.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(totalDuration)}</span>
                    </>
                  )}
                  {playlist.likes_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{playlist.likes_count} likes</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handlePlayAll}
                    disabled={tracks.length === 0}
                    className="px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-full transition-colors flex items-center gap-2"
                  >
                    <FiPlay className="w-5 h-5" />
                    Play
                  </button>

                  <button
                    onClick={() => likePlaylistMutation.mutate()}
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      playlist.is_liked
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-600 hover:text-purple-600'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${playlist.is_liked ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="w-12 h-12 rounded-full border-2 border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-600 hover:text-purple-600 flex items-center justify-center transition-all"
                  >
                    <FiShare2 className="w-5 h-5" />
                  </button>

                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          setEditData({
                            title: playlist.title,
                            description: playlist.description || '',
                            is_public: playlist.is_public
                          });
                          setShowEditModal(true);
                        }}
                        className="w-12 h-12 rounded-full border-2 border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-600 hover:text-blue-600 flex items-center justify-center transition-all"
                      >
                        <FiEdit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={handleDelete}
                        className="w-12 h-12 rounded-full border-2 border-gray-400 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-red-600 hover:text-red-600 flex items-center justify-center transition-all"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracks */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          {tracks.length === 0 ? (
            <div className="text-center py-16">
              <FiMusic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No tracks in this playlist yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((playlistTrack: any, index: number) => {
                const track = playlistTrack.track;
                if (!track) return null;

                const isCurrentlyPlaying = currentTrack?.id === track.id && isPlaying;

                return (
                  <div
                    key={playlistTrack.id}
                    className={`group flex items-center gap-4 p-4 rounded-lg transition-colors ${
                      isCurrentlyPlaying
                        ? 'bg-purple-100 dark:bg-purple-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {/* Index/Play */}
                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                      {isCurrentlyPlaying ? (
                        <div className="w-4 h-4 bg-purple-600 rounded animate-pulse" />
                      ) : (
                        <button
                          onClick={() => playTrack(track)}
                          className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiPlay className="w-4 h-4 text-gray-900 dark:text-white" />
                        </button>
                      )}
                      <span className={`text-sm ${isCurrentlyPlaying ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'} group-hover:hidden`}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/tracks/${track.id}`}
                        className="text-gray-900 dark:text-white hover:text-purple-600 font-semibold truncate block"
                      >
                        {track.title}
                      </Link>
                      <Link
                        href={`/artists/${track.album?.artist?.id}`}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 truncate block"
                      >
                        {track.album?.artist?.name || 'Unknown Artist'}
                      </Link>
                    </div>

                    {/* Album */}
                    <Link
                      href={`/albums/${track.album?.id}`}
                      className="hidden md:block flex-1 min-w-0 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 truncate"
                    >
                      {track.album?.title || 'Unknown Album'}
                    </Link>

                    {/* Duration */}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDuration(track.duration)}
                    </span>

                    {/* Remove */}
                    {isOwner && (
                      <button
                        onClick={() => removeTrackMutation.mutate(track.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Playlist</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={editData.is_public}
                  onChange={(e) => setEditData({ ...editData, is_public: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                />
                <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
                  Make playlist public
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                disabled={updatePlaylistMutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
              >
                {updatePlaylistMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MusicPlayer />
    </>
  );
}

