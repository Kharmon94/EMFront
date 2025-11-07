'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { MessageModal } from '@/components/MessageModal';
import { 
  FiUser, FiHeart, FiMusic, FiShoppingBag, FiMessageCircle, FiShare2
} from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [showMessageModal, setShowMessageModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => api.get(`/users/${userId}`).then(res => res.data)
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profile link copied!');
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

  const user = data?.user;

  if (!user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
          <div className="text-red-500">User not found</div>
        </div>
      </>
    );
  }

  const displayName = user.email?.split('@')[0] || `User ${user.id}`;

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white dark:bg-black pt-12 md:pt-16 pb-24 md:pb-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-900 to-purple-900 dark:from-purple-900 dark:to-pink-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{displayName}</h1>
                <p className="text-white/80">Music Enthusiast</p>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FiShare2 className="w-4 h-4" />
                    Share Profile
                  </button>
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 text-center">
              <FiHeart className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.following_count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 text-center">
              <FiMusic className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.playlists_count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Playlists</p>
            </div>

            <div className="bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6 text-center">
              <FiShoppingBag className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.orders_count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Orders</p>
            </div>
          </div>

          {/* Public Info */}
          <div className="mt-8 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
            {user.bio ? (
              <p className="text-gray-700 dark:text-gray-300">{user.bio}</p>
            ) : (
              <p className="text-gray-500 dark:text-gray-500 italic">This user hasn't added a bio yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href={`/playlists?user=${userId}`}
              className="flex items-center gap-3 p-6 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              <FiMusic className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Playlists</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View public playlists</p>
              </div>
            </Link>

            <button
              onClick={() => setShowMessageModal(true)}
              className="flex items-center gap-3 p-6 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left"
            >
              <FiMessageCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Send Message</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Start a conversation</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        recipientId={parseInt(userId)}
        recipientName={displayName}
      />
    </>
  );
}

