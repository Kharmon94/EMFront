'use client';

import { useState, Fragment } from 'react';
import { FiShare2, FiCopy, FiMail, FiMessageCircle, FiX } from 'react-icons/fi';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface ShareButtonProps {
  item: any;
  type: 'track' | 'album' | 'video' | 'mini' | 'event' | 'artist' | 'playlist';
  className?: string;
}

export function ShareButton({ item, type, className = '' }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getShareUrl = () => {
    return `${window.location.origin}/${type}s/${item.id}`;
  };

  const getShareText = () => {
    const title = item.title || item.name;
    const artist = item.artist?.name || '';
    return `Check out ${title}${artist ? ` by ${artist}` : ''} on EncryptedMedia!`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success('Link copied to clipboard!');
    setIsOpen(false);
    
    // Track share
    trackShare('copy_link');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title || item.name,
          text: getShareText(),
          url: getShareUrl()
        });
        trackShare('social_media');
        setIsOpen(false);
      } catch (error) {
        // User cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(item.title || item.name);
    const body = encodeURIComponent(`${getShareText()}\n\n${getShareUrl()}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    trackShare('email');
    setIsOpen(false);
  };

  const handleDMShare = () => {
    // Navigate to messages with pre-filled content
    const shareText = `${getShareUrl()}`;
    sessionStorage.setItem('pending_share', shareText);
    window.location.href = '/messages';
  };

  const trackShare = async (shareType: string) => {
    try {
      await api.post(`/${type}s/${item.id}/share`, { share_type: shareType });
    } catch (error) {
      // Silent fail - sharing still works
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className || 'p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-colors'}
      >
        <FiShare2 className="w-5 h-5" />
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                      Share {type}
                    </Dialog.Title>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <FiX className="w-5 h-5 text-gray-900 dark:text-white" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Copy Link */}
                    <button
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiCopy className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Copy Link</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Share via clipboard</div>
                      </div>
                    </button>

                    {/* Native Share */}
                    {typeof navigator !== 'undefined' && 'share' in navigator && (
                      <button
                        onClick={handleNativeShare}
                        className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <FiShare2 className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-semibold text-gray-900 dark:text-white">Share</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Share via other apps</div>
                        </div>
                      </button>
                    )}

                    {/* Email */}
                    <button
                      onClick={handleEmailShare}
                      className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiMail className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Email</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Send via email</div>
                      </div>
                    </button>

                    {/* DM Friend */}
                    <button
                      onClick={handleDMShare}
                      className="w-full flex items-center gap-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiMessageCircle className="w-5 h-5 text-pink-600" />
                      <div className="text-left">
                        <div className="font-semibold text-gray-900 dark:text-white">Send to Friend</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Share via DM</div>
                      </div>
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

