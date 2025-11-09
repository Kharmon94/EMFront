'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiPlay, FiHeart, FiShare2, FiMoreVertical, FiCheckCircle, FiPlus, FiList } from 'react-icons/fi';
import { formatDuration } from '@/lib/utils';
import { AddToPlaylistModal } from '../AddToPlaylistModal';
import { ShareModal } from '../ShareModal';
import { usePlayerStore } from '@/lib/store/playerStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ContentCardProps {
  item: any;
  type: 'track' | 'album' | 'video' | 'mini' | 'event';
  onPlay?: (item: any) => void;
  showArtist?: boolean;
}

export function ContentCard({
  item,
  type,
  onPlay,
  showArtist = true
}: ContentCardProps) {
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLiked, setIsLiked] = useState(item.is_liked || false);
  const { addToQueue, playTrack } = usePlayerStore();

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

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isLiked) {
        await api.delete(`/${type}s/${item.id}/unlike`);
        setIsLiked(false);
        toast.success('Removed from liked');
      } else {
        await api.post(`/${type}s/${item.id}/like`);
        setIsLiked(true);
        toast.success('Added to liked');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddToQueue = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (type === 'track') {
        addToQueue(item);
        toast.success('Added to queue');
      } else if (type === 'album') {
        // Fetch album tracks and add all to queue
        const response = await api.get(`/albums/${item.id}`);
        const tracks = response.data.tracks || [];
        tracks.forEach((track: any) => addToQueue({
          ...track,
          album: { id: item.id, title: item.title, cover_url: item.cover_url },
          artist: item.artist
        }));
        toast.success(`Added ${tracks.length} tracks to queue`);
      }
    } catch (error) {
      console.error('Failed to add to queue:', error);
      toast.error('Failed to add to queue');
    }
  };

  const handleAddToPlaylist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPlaylistModal(true);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };
  
  return (
    <div className="group relative">
      <Link href={getHref()} className="block">
        {/* Cover/Thumbnail */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-800 mb-3">
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
            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-500">
              {item.views_count > 0 && <span>{formatCount(item.views_count)} views</span>}
              {item.likes_count > 0 && <span>{formatCount(item.likes_count)} likes</span>}
              {item.plays_count > 0 && <span>{formatCount(item.plays_count)} plays</span>}
            </div>
          )}
        </div>
      </Link>
      
      {/* Quick Actions - Top Right */}
      <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Like Button */}
        <button
          onClick={handleLike}
          className={`p-2 rounded-full backdrop-blur-md transition-all ${
            isLiked
              ? 'bg-red-500/90 text-white'
              : 'bg-black/60 hover:bg-black/80 text-white'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <FiHeart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Add to Queue (for tracks/albums only) */}
        {(type === 'track' || type === 'album') && (
          <button
            onClick={handleAddToQueue}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all"
            title="Add to Queue"
          >
            <FiList className="w-4 h-4" />
          </button>
        )}

        {/* Add to Playlist (for tracks only) */}
        {type === 'track' && (
          <button
            onClick={handleAddToPlaylist}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all"
            title="Add to Playlist"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all"
          title="Share"
        >
          <FiShare2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Modals */}
      {type === 'track' && (
        <AddToPlaylistModal
          isOpen={showPlaylistModal}
          onClose={() => setShowPlaylistModal(false)}
          trackId={item.id}
          trackTitle={item.title}
        />
      )}
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={getHref()}
        title={getTitle()}
        description={getSubtitle()}
        type={type}
      />
    </div>
  );
}

function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

