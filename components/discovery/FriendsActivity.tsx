'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { FiUsers, FiHeart, FiMessageCircle, FiPlay } from 'react-icons/fi';
import api from '@/lib/api';

export function FriendsActivity() {
  const { data } = useQuery({
    queryKey: ['friends-activity'],
    queryFn: () => api.get('/discovery/friends_activity'),
    refetchInterval: 60000, // Refresh every minute
  });
  
  const activities = data?.data?.activities || [];
  
  if (activities.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <FiUsers className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-gray-900 dark:text-white">Friends Activity</h3>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity: any, index: number) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getIcon = () => {
    switch (activity.activity_type) {
      case 'liked': return <FiHeart className="w-4 h-4 text-red-500" />;
      case 'commented': return <FiMessageCircle className="w-4 h-4 text-blue-500" />;
      case 'streamed': return <FiPlay className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };
  
  const getActionText = () => {
    switch (activity.activity_type) {
      case 'liked': return 'liked';
      case 'commented': return 'commented on';
      case 'streamed': return 'listened to';
      case 'shared': return 'shared';
      default: return 'interacted with';
    }
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 dark:text-white">
          <span className="font-medium">{activity.friend?.email || 'Someone'}</span>
          <span className="text-gray-600 dark:text-gray-400"> {getActionText()} </span>
          <Link
            href={`/${activity.content?.type}s/${activity.content?.id}`}
            className="font-medium text-purple-600 hover:text-purple-700 truncate"
          >
            {activity.content?.title}
          </Link>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
          {formatTimeAgo(activity.timestamp)}
        </p>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

