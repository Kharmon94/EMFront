'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiCopy, FiCheck, FiTwitter, FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { FaReddit, FaTelegram, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  description?: string;
  type?: 'album' | 'track' | 'video' | 'event' | 'artist' | 'merch';
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  url, 
  title, 
  description = '',
  type = 'album'
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = [
    {
      name: 'Twitter',
      icon: <FiTwitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-[#1DA1F2] hover:bg-[#1a8cd8]'
    },
    {
      name: 'Facebook',
      icon: <FiFacebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'bg-[#1877F2] hover:bg-[#166fe5]'
    },
    {
      name: 'Reddit',
      icon: <FaReddit className="w-5 h-5" />,
      url: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      color: 'bg-[#FF4500] hover:bg-[#e63e00]'
    },
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp className="w-5 h-5" />,
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-[#25D366] hover:bg-[#20bd5a]'
    },
    {
      name: 'Telegram',
      icon: <FaTelegram className="w-5 h-5" />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: 'bg-[#0088cc] hover:bg-[#007ab8]'
    }
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSocialShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const embedCode = `<iframe src="${fullUrl}" width="100%" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;

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
                      Share {type}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 truncate">
                    {title}
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-6">
                  {/* Copy Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Copy Link
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fullUrl}
                        readOnly
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-sm"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          copied
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        {copied ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <FiCopy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Social Share */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Share on Social Media
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {shareLinks.map((link) => (
                        <button
                          key={link.name}
                          onClick={() => handleSocialShare(link.url)}
                          className={`flex flex-col items-center gap-2 p-4 ${link.color} text-white rounded-lg transition-colors`}
                          title={`Share on ${link.name}`}
                        >
                          {link.icon}
                          <span className="text-xs font-medium">{link.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Embed Code (for albums, tracks, videos) */}
                  {(type === 'album' || type === 'track' || type === 'video') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Embed Code
                      </label>
                      <div className="relative">
                        <textarea
                          value={embedCode}
                          readOnly
                          rows={3}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white text-xs font-mono resize-none"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(embedCode);
                            toast.success('Embed code copied!');
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Paste this code on your website to embed this {type}
                      </p>
                    </div>
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

