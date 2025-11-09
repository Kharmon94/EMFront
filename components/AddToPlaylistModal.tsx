'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiPlus, FiSearch, FiMusic, FiCheck } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackId?: number;
  trackIds?: number[];
  trackTitle?: string;
}

export function AddToPlaylistModal({ 
  isOpen, 
  onClose, 
  trackId, 
  trackIds,
  trackTitle 
}: AddToPlaylistModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const queryClient = useQueryClient();

  // Fetch user's playlists
  const { data: playlistsData, isLoading } = useQuery({
    queryKey: ['playlists', 'my'],
    queryFn: () => api.get('/playlists?my=true'),
    enabled: isOpen
  });

  const playlists = playlistsData?.data?.playlists || [];
  const filteredPlaylists = playlists.filter((playlist: any) =>
    playlist.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create new playlist mutation
  const createPlaylistMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await api.post('/playlists', {
        playlist: { title: name, is_public: false }
      });
      return response.data.playlist;
    },
    onSuccess: async (playlist) => {
      // Add track(s) to the new playlist
      if (trackId) {
        await api.post(`/playlists/${playlist.id}/add_track/${trackId}`);
      } else if (trackIds) {
        for (const id of trackIds) {
          await api.post(`/playlists/${playlist.id}/add_track/${id}`);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      toast.success(`Created "${playlist.title}" and added ${trackIds ? trackIds.length + ' tracks' : 'track'}`);
      setIsCreating(false);
      setNewPlaylistName('');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create playlist');
    }
  });

  // Add to existing playlist mutation
  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: number) => {
      if (trackId) {
        return await api.post(`/playlists/${playlistId}/add_track/${trackId}`);
      } else if (trackIds) {
        for (const id of trackIds) {
          await api.post(`/playlists/${playlistId}/add_track/${id}`);
        }
      }
    },
    onSuccess: (_, playlistId) => {
      const playlist = playlists.find((p: any) => p.id === playlistId);
      toast.success(`Added to "${playlist?.title}"`);
      onClose();
    },
    onError: (error: any) => {
      if (error.response?.data?.error?.includes('already')) {
        toast.error('Track already in playlist');
      } else {
        toast.error('Failed to add to playlist');
      }
    }
  });

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) {
      toast.error('Please enter a playlist name');
      return;
    }
    createPlaylistMutation.mutate(newPlaylistName.trim());
  };

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setIsCreating(false);
      setNewPlaylistName('');
    }
  }, [isOpen]);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                      Add to Playlist
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  {trackTitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
                      {trackTitle}
                    </p>
                  )}
                </div>

                {/* Search */}
                {!isCreating && (
                  <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search your playlists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  {isCreating ? (
                    /* Create New Playlist Form */
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Playlist Name
                      </label>
                      <input
                        type="text"
                        placeholder="My Awesome Playlist"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCreatePlaylist();
                          }
                        }}
                        autoFocus
                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleCreatePlaylist}
                          disabled={createPlaylistMutation.isPending}
                          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors"
                        >
                          {createPlaylistMutation.isPending ? 'Creating...' : 'Create & Add'}
                        </button>
                        <button
                          onClick={() => setIsCreating(false)}
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Create New Playlist Button */}
                      <button
                        onClick={() => setIsCreating(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg mb-4 transition-all shadow-md hover:shadow-lg"
                      >
                        <FiPlus className="w-5 h-5" />
                        <span className="font-medium">Create New Playlist</span>
                      </button>

                      {/* Playlists List */}
                      {isLoading ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                            </div>
                          ))}
                        </div>
                      ) : filteredPlaylists.length > 0 ? (
                        <div className="space-y-2">
                          {filteredPlaylists.map((playlist: any) => (
                            <button
                              key={playlist.id}
                              onClick={() => addToPlaylistMutation.mutate(playlist.id)}
                              disabled={addToPlaylistMutation.isPending}
                              className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg transition-all group disabled:opacity-50"
                            >
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center flex-shrink-0">
                                <FiMusic className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                  {playlist.title}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {playlist.tracks_count || 0} tracks
                                </div>
                              </div>
                              <FiCheck className="w-5 h-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FiMusic className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {searchQuery ? 'No playlists found' : 'No playlists yet'}
                          </p>
                          <button
                            onClick={() => setIsCreating(true)}
                            className="mt-3 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium text-sm"
                          >
                            Create your first playlist
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

