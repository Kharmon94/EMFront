'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiTrash2, FiList, FiClock, FiMenu, FiPlay } from 'react-icons/fi';
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

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
  const upNext = queue.slice(currentIndex + 1);
  const totalDuration = queue.reduce((sum, track) => sum + track.duration, 0);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    setDraggedIndex(index);
    
    // Add drag image ghost
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    if (fromIndex !== toIndex) {
      // Adjust indices relative to current track
      const adjustedFromIndex = currentIndex + 1 + fromIndex;
      const adjustedToIndex = currentIndex + 1 + toIndex;
      reorderQueue(adjustedFromIndex, adjustedToIndex);
      toast.success('Queue reordered');
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
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <FiList className="text-purple-600" /> Queue
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 active:scale-90 transition-all"
                          aria-label="Close queue"
                        >
                          <FiX className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                      </div>
                      
                      {/* Queue Stats */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{queue.length} {queue.length === 1 ? 'track' : 'tracks'}</span>
                        <span className="flex items-center gap-1">
                          <FiClock className="w-4 h-4" />
                          {formatDuration(totalDuration)}
                        </span>
                      </div>

                      {/* Drag Hint */}
                      {upNext.length > 1 && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <FiMenu className="w-3 h-3" />
                          Drag to reorder
                        </div>
                      )}
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
                        <div className="px-6 py-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 dark:from-purple-600/20 dark:to-blue-600/20 border-l-4 border-purple-600">
                          <div className="text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400 font-semibold mb-3 flex items-center gap-2">
                            <FiPlay className="w-3 h-3 animate-pulse" />
                            Now Playing
                          </div>
                          <div className="flex items-center gap-3">
                            {currentTrack.album.cover_url && (
                              <div className="relative">
                                <img
                                  src={currentTrack.album.cover_url}
                                  alt={currentTrack.title}
                                  className="w-14 h-14 rounded-lg shadow-md"
                                />
                                <div className="absolute inset-0 bg-purple-600/20 rounded-lg animate-pulse" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                                {currentTrack.title}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {currentTrack.artist.name}
                                {currentTrack.artist.verified && (
                                  <span className="ml-1 text-blue-500">✓</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 tabular-nums">
                                {formatDuration(currentTrack.duration)}
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
                          <div className="space-y-1">
                            {upNext.map((track, index) => (
                              <div
                                key={`${track.id}-${index}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`flex items-center gap-3 p-3 rounded-lg group transition-all ${
                                  draggedIndex === index 
                                    ? 'opacity-50 scale-95' 
                                    : dragOverIndex === index
                                    ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 scale-105'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-2 border-transparent'
                                }`}
                              >
                                {/* Drag Handle */}
                                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                  <FiMenu className="w-5 h-5" />
                                </div>

                                {/* Track Number */}
                                <div className="flex-shrink-0 w-6 text-center text-xs font-semibold text-gray-500 dark:text-gray-500">
                                  {index + 1}
                                </div>

                                {/* Album Art */}
                                {track.album.cover_url && (
                                  <img
                                    src={track.album.cover_url}
                                    alt={track.title}
                                    className="w-12 h-12 rounded-md flex-shrink-0 shadow-sm"
                                  />
                                )}

                                {/* Track Info */}
                                <div 
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => {
                                    playTrack(track, queue);
                                    toast.success(`Playing ${track.title}`);
                                  }}
                                >
                                  <div className="font-medium text-sm text-gray-900 dark:text-white truncate flex items-center gap-2">
                                    {track.title}
                                    <FiPlay className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {track.artist.name}
                                  </div>
                                </div>

                                {/* Duration */}
                                <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-500 tabular-nums">
                                  {formatDuration(track.duration)}
                                </div>

                                {/* Remove Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const adjustedIndex = currentIndex + 1 + index;
                                    removeFromQueue(track.id);
                                    toast.success('Removed from queue');
                                  }}
                                  className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all active:scale-90"
                                  title="Remove from queue"
                                >
                                  <FiX className="w-4 h-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* History */}
                      {queueHistory.length > 0 && (
                        <div className="px-6 py-4 border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500 font-semibold mb-3 flex items-center gap-2">
                            <FiClock className="w-3 h-3" />
                            Recently Played
                          </div>
                          <div className="space-y-1">
                            {queueHistory.slice(0, 10).map((track, index) => (
                              <div
                                key={`history-${track.id}-${index}`}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group transition-all active:scale-98"
                                onClick={() => {
                                  playTrack(track, [track]);
                                  toast.success(`Playing ${track.title}`);
                                }}
                              >
                                {track.album.cover_url && (
                                  <img
                                    src={track.album.cover_url}
                                    alt={track.title}
                                    className="w-10 h-10 rounded opacity-70 group-hover:opacity-100 flex-shrink-0 transition-opacity"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white truncate transition-colors flex items-center gap-2">
                                    {track.title}
                                    <FiPlay className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                    {track.artist.name}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500 tabular-nums">
                                  {formatDuration(track.duration)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {queue.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64 px-6 text-center">
                          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                            <FiList className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                          </div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your queue is empty</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Start playing music to build your queue
                          </p>
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

