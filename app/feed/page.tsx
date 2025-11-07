'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { PermissionGuard } from '@/components/PermissionGuard';
import { ContentCard } from '@/components/discovery/ContentCard';
import { InfiniteScroll } from '@/components/discovery/InfiniteScroll';
import { FriendsActivity } from '@/components/discovery/FriendsActivity';
import { usePullToRefresh } from '@/lib/usePullToRefresh';
import { FiActivity } from 'react-icons/fi';
import api from '@/lib/api';
import Link from 'next/link';

export default function FeedPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, refetch, hasNextPage } = useQuery({
    queryKey: ['discovery-feed', page],
    queryFn: () => api.get(`/discovery/feed?limit=${limit * page}`)
  });

  const feed = data?.data?.feed || [];
  const hasMore = feed.length >= limit * page;

  // Pull to refresh
  const { isPulling, isRefreshing, progress } = usePullToRefresh({
    onRefresh: async () => {
      setPage(1);
      await refetch();
    },
    enabled: typeof window !== 'undefined' && window.innerWidth < 768
  });

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderFeedItem = (item: any) => {
    const { content, context, friend, activity_type } = item;

    // Context banner for different feed item types
    const getContextBanner = () => {
      if (context === 'new_from_following') {
        return (
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
            New from {content.artist?.name || 'following'}
          </div>
        );
      }
      if (context === 'trending') {
        return (
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
            🔥 Trending now
          </div>
        );
      }
      if (context === 'recommended') {
        return (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
            ✨ Recommended for you
          </div>
        );
      }
      if (context === 'friend_activity' && friend) {
        return (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {friend.email} {activity_type} this
          </div>
        );
      }
      return null;
    };

    return (
      <div key={`${item.type}-${item.id}`} className="mb-6">
        {getContextBanner()}
        <ContentCard
          item={content}
          type={item.type}
          showArtist={true}
        />
      </div>
    );
  };

  return (
    <PermissionGuard require="auth" redirectTo="/">
      <Navigation />
      
      {/* Pull to refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div 
          className="fixed top-12 left-0 right-0 flex justify-center z-40 transition-all"
          style={{ transform: `translateY(${Math.min(progress * 60, 60)}px)` }}
        >
          <div className={`px-4 py-2 bg-purple-600 text-white rounded-full text-sm ${isRefreshing ? 'animate-spin' : ''}`}>
            {isRefreshing ? '↻ Refreshing...' : progress >= 1 ? 'Release to refresh' : '↓ Pull to refresh'}
          </div>
        </div>
      )}
      
      <main className="min-h-screen bg-white dark:bg-gradient-to-b dark:from-black dark:via-gray-900 dark:to-black pb-32">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 pb-8">
          <div className="flex gap-8">
            {/* Main Feed */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <FiActivity className="w-8 h-8 text-purple-600" />
                  Your Feed
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Personalized content from artists you follow and recommendations
                </p>
              </div>

              {/* Feed Grid */}
              <InfiniteScroll
                onLoadMore={loadMore}
                hasMore={hasMore}
                loading={isLoading}
              >
                {feed.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {feed.map((item: any) => renderFeedItem(item))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <FiActivity className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Your feed is empty
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Follow some artists to see their latest releases here!
                    </p>
                    <Link
                      href="/music"
                      className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      Explore Music
                    </Link>
                  </div>
                )}
              </InfiniteScroll>
            </div>

            {/* Sidebar - Friends Activity (Desktop only) */}
            <div className="hidden xl:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FriendsActivity />
              </div>
            </div>
          </div>
        </div>
      </main>
    </PermissionGuard>
  );
}

