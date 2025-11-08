'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiFileText } from 'react-icons/fi';
import api from '@/lib/api';

interface LyricsPanelProps {
  trackId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function LyricsPanel({ trackId, isOpen, onClose }: LyricsPanelProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && trackId) {
      fetchLyrics();
    }
  }, [isOpen, trackId]);

  const fetchLyrics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/tracks/${trackId}`);
      setLyrics(response.data.track.lyrics || null);
    } catch (error) {
      console.error('Failed to fetch lyrics:', error);
    } finally {
      setLoading(false);
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
                          <FiFileText /> Lyrics
                        </Dialog.Title>
                        <button
                          onClick={onClose}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <FiX className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Lyrics Content */}
                    <div className="flex-1 overflow-y-auto">
                      {loading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      ) : lyrics ? (
                        <div className="px-6 py-6">
                          <div className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                            {lyrics.split('\n').map((line, index) => (
                              <p key={index} className="mb-3">
                                {line || '\u00A0'}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-500 px-6 text-center">
                          <FiFileText className="w-16 h-16 mb-4 opacity-30" />
                          <p className="text-lg font-medium mb-2">No lyrics available</p>
                          <p className="text-sm">Lyrics haven't been added for this track yet</p>
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

