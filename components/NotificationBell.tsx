'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiBell, FiCheck, FiX } from 'react-icons/fi';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications({ limit: 20 }),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => api.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unread_count || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsReadMutation.mutate()}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  <FiCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
              ) : notifications.length > 0 ? (
                <div>
                  {notifications.map((notif: any) => (
                    <NotificationItem
                      key={notif.id}
                      notification={notif}
                      onMarkAsRead={() => markAsReadMutation.mutate(notif.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FiBell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead }: any) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'new_album':
      case 'new_track':
        return <FiMusic className="w-5 h-5 text-blue-400" />;
      case 'new_event':
        return <FiCalendar className="w-5 h-5 text-green-400" />;
      case 'new_livestream':
      case 'stream_live':
        return <FiVideo className="w-5 h-5 text-red-400" />;
      case 'new_follower':
        return <FiUsers className="w-5 h-5 text-purple-400" />;
      case 'new_like':
        return <FiHeart className="w-5 h-5 text-red-400" />;
      case 'new_comment':
        return <FiMessageCircle className="w-5 h-5 text-blue-400" />;
      default:
        return <FiBell className="w-5 h-5 text-gray-400" />;
    }
  };

  const getLink = (notif: any) => {
    const data = notif.data || {};
    switch (notif.type) {
      case 'new_album':
        return `/albums/${data.album_id}`;
      case 'new_event':
        return `/events/${data.event_id}`;
      case 'new_livestream':
      case 'stream_live':
        return `/livestreams/${data.livestream_id}`;
      default:
        return null;
    }
  };

  const link = getLink(notification);
  const isUnread = !notification.read;

  const content = (
    <div
      className={`p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors cursor-pointer ${
        isUnread ? 'bg-purple-900/10' : ''
      }`}
      onClick={() => {
        if (isUnread) onMarkAsRead();
        if (link) window.location.href = link;
      }}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-white text-sm">{notification.title}</p>
            {isUnread && (
              <span className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
          <p className="text-xs text-gray-600 mt-1">
            {new Date(notification.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );

  return link ? <a href={link}>{content}</a> : content;
}

// Add these imports at the top of the file (they're missing)
import { FiMusic, FiCalendar, FiVideo, FiUsers } from 'react-icons/fi';

