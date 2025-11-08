'use client';

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiTrash2, FiList, FiClock } from 'react-icons/fi';
import { usePlayerStore } from '@/lib/store/playerStore';
import { formatDuration } from '@/lib/utils';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QueueDrawer({ isOpen, onClose }: QueueDrawerProps) {
  const { 
    queue, 
    queueHistory, 
    currentTrack, 
    removeFromQueue, 
    reorderQueue,
    clearQueue,
    playTrack
  } = usePlayerStore();

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const upNext = queue.slice(currentIndex + 1);
  const totalDuration = queue.reduce((sum, track) => sum + track.duration, 0);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (fromIndex !== toIndex) {
      // Adjust indices relative to current track
      const adjustedFromIndex = currentIndex + 1 + fromIndex;
      const adjustedToIndex = currentIndex + 1 + toIndex;
      reorderQueue(adjustedFromIndex, adjustedToIndex);
    }
  };

  const handleSaveAsPlaylist = async () => {
    const name = prompt('Enter playlist name:');
    if (!name) return;

    try {
      const response = await api.post('/playlists', {
        playlist: { title: name, is_public: false }
      });

      const playlistId = response.data.playlist.id;

      // Add all tracks from queue
      for (const track of queue) {
        await api.post(`/playlists/${playlistId}/add_track/${track.id}`);
      }

      toast.success('Queue saved as playlist!');
    } catch (error) {
      toast.error('Failed to save playlist');
    }
  };

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
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white dark:bg-gray-900 shadow-xl">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <FiList /> Queue
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <FiX className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                      </div>
                      
                      {/* Queue Stats */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>{queue.length} tracks</span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {formatDuration(totalDuration)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 flex gap-2">
                      <button
                        onClick={handleSaveAsPlaylist}
                        disabled={queue.length === 0}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Save as Playlist
                      </button>
                      <button
                        onClick={() => {
                          clearQueue();
                          toast.success('Queue cleared');
                        }}
                        disabled={queue.length === 0}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Clear
                      </button>
                    </div>

                    {/* Queue Content */}
                    <div className="flex-1 overflow-y-auto">
                      {/* Now Playing */}
                      {currentTrack && (
                        <div className="px-6 py-4 bg-purple-600/10 dark:bg-purple-600/20">
                          <div className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400 font-semibold mb-2">
                            Now Playing
                          </div>
                          <div className="flex items-center gap-3">
                            {currentTrack.album.cover_url && (
                              <img
                                src={currentTrack.album.cover_url}
                                alt={currentTrack.title}
                                className="w-12 h-12 rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white truncate">
                                {currentTrack.title}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {currentTrack.artist.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Up Next */}
                      {upNext.length > 0 && (
                        <div className="px-6 py-4">
                          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 font-semibold mb-3">
                            Up Next ({upNext.length})
                          </div>
                          <div className="space-y-2">
                            {upNext.map((track, index) => (
                              <div
                                key={`${track.id}-${index}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-move group"
                              >
                                {track.album.cover_url && (
                                  <img
                                    src={track.album.cover_url}
                                    alt={track.title}
                                    className="w-10 h-10 rounded flex-shrink-0"
                                  />
                                )}
                                <div 
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => playTrack(track, queue)}
                                >
                                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {track.title}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {track.artist.name}
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    removeFromQueue(track.id);
                                    toast.success('Removed from queue');
                                  }}
                                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                                >
                                  <FiX className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* History */}
                      {queueHistory.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 font-semibold mb-3">
                            Recently Played
                          </div>
                          <div className="space-y-2">
                            {queueHistory.slice(0, 10).map((track, index) => (
                              <div
                                key={`history-${track.id}-${index}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                onClick={() => playTrack(track, [track])}
                              >
                                {track.album.cover_url && (
                                  <img
                                    src={track.album.cover_url}
                                    alt={track.title}
                                    className="w-10 h-10 rounded opacity-60 flex-shrink-0"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate opacity-75">
                                    {track.title}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {track.artist.name}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {queue.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-500">
                          <FiList className="w-16 h-16 mb-4 opacity-30" />
                          <p>Your queue is empty</p>
                          <p className="text-sm">Play some music to get started!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

