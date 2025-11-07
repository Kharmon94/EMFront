'use client';

import Link from 'next/link';
import { FiPlay, FiHeart, FiShare2, FiMoreVertical, FiCheckCircle } from 'react-icons/fi';
import { formatDuration } from '@/lib/utils';

interface ContentCardProps {
  item: any;
  type: 'track' | 'album' | 'video' | 'mini' | 'event';
  onPlay?: (item: any) => void;
  onLike?: (item: any) => void;
  onShare?: (item: any) => void;
  showArtist?: boolean;
}

export function ContentCard({
  item,
  type,
  onPlay,
  onLike,
  onShare,
  showArtist = true
}: ContentCardProps) {
  const getHref = () => {
    switch (type) {
      case 'track': return `/tracks/${item.id}`;
      case 'album': return `/albums/${item.id}`;
      case 'video': return `/videos/${item.id}`;
      case 'mini': return `/minis/${item.id}`;
      case 'event': return `/events/${item.id}`;
      default: return '#';
    }
  };
  
  const getCoverUrl = () => {
    switch (type) {
      case 'track': return item.album?.cover_url;
      case 'album': return item.cover_url;
      case 'video':
      case 'mini': return item.thumbnail_url;
      case 'event': return item.cover_url || item.artist?.avatar_url;
      default: return null;
    }
  };
  
  const getTitle = () => item.title || item.name;
  const getSubtitle = () => {
    if (type === 'track' || type === 'album') return item.artist?.name;
    if (type === 'video' || type === 'mini') return item.artist?.name;
    if (type === 'event') return `${item.venue} • ${item.location}`;
    return '';
  };
  
  return (
    <div className="group relative">
      <Link href={getHref()} className="block">
        {/* Cover/Thumbnail */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 mb-3">
          {getCoverUrl() ? (
            <img
              src={getCoverUrl()}
              alt={getTitle()}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <span className="text-4xl font-bold text-white">
                {getTitle()?.charAt(0) || '?'}
              </span>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            {onPlay && (type === 'track' || type === 'album') && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onPlay(item);
                }}
                className="w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center text-white transition-all transform hover:scale-110"
              >
                <FiPlay className="w-6 h-6 ml-1" />
              </button>
            )}
          </div>
          
          {/* Duration Badge */}
          {item.duration && (
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 rounded text-xs text-white">
              {formatDuration(item.duration)}
            </div>
          )}
          
          {/* Artist verified badge */}
          {item.artist?.verified && (
            <div className="absolute top-2 right-2">
              <FiCheckCircle className="w-5 h-5 text-blue-500" />
            </div>
          )}
        </div>
        
        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {getTitle()}
          </h3>
          {showArtist && getSubtitle() && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {getSubtitle()}
            </p>
          )}
          
          {/* Stats */}
          {(item.views_count || item.likes_count || item.plays_count) && (
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
              {item.views_count > 0 && <span>{formatCount(item.views_count)} views</span>}
              {item.likes_count > 0 && <span>{formatCount(item.likes_count)} likes</span>}
              {item.plays_count > 0 && <span>{formatCount(item.plays_count)} plays</span>}
            </div>
          )}
        </div>
      </Link>
      
      {/* Quick Actions */}
      <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onLike && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onLike(item);
            }}
            className="p-2 rounded-full bg-black/80 hover:bg-purple-600 text-white transition-colors"
          >
            <FiHeart className="w-4 h-4" />
          </button>
        )}
        {onShare && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onShare(item);
            }}
            className="p-2 rounded-full bg-black/80 hover:bg-purple-600 text-white transition-colors"
          >
            <FiShare2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

