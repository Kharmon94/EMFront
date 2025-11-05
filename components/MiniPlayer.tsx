'use client';

import { useEffect, useRef, useState } from 'react';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreVertical, FiPlay, FiPause } from 'react-icons/fi';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface MiniPlayerProps {
  mini: any;
  isActive: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onLike?: () => void;
  onShare?: () => void;
}

export default function MiniPlayer({
  mini,
  isActive,
  onNext,
  onPrevious,
  onLike,
  onShare
}: MiniPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasLoggedView, setHasLoggedView] = useState(false);
  const [watchTime, setWatchTime] = useState(0);

  // Auto-play when becomes active
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else if (!isActive && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  // Track watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isActive) {
      interval = setInterval(() => {
        setWatchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isActive]);

  // Log view after 3 seconds
  useEffect(() => {
    if (watchTime >= 3 && !hasLoggedView && isActive) {
      api.logMiniView(mini.id, watchTime, mini.access_tier || 'free')
        .then(() => setHasLoggedView(true))
        .catch(console.error);
    }
  }, [watchTime, mini.id, hasLoggedView, mini.access_tier, isActive]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isActive) return;
      
      if (e.key === 'ArrowUp' && onPrevious) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowDown' && onNext) {
        e.preventDefault();
        onNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onNext, onPrevious]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleDoubleClick = () => {
    if (onLike) onLike();
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    // Single click to pause/play
    if (e.detail === 1) {
      togglePlay();
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative w-full h-screen bg-black snap-start snap-always">
      {/* Video */}
      <video
        ref={videoRef}
        src={mini.video_url}
        className="w-full h-full object-contain"
        loop
        playsInline
        onClick={handleVideoClick}
        onDoubleClick={handleDoubleClick}
        onEnded={() => {
          if (onNext) onNext();
        }}
      />

      {/* Play/Pause indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-6">
            <FiPlay size={48} className="text-white" />
          </div>
        </div>
      )}

      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent h-32 pointer-events-none" />

      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-64 pointer-events-none" />

      {/* Top controls */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <h1 className="text-white font-bold text-xl">Mini's</h1>
        <button className="text-white p-2">
          <FiMoreVertical size={24} />
        </button>
      </div>

      {/* Artist info and controls */}
      <div className="absolute bottom-20 left-0 right-0 px-4 z-10">
        <div className="flex gap-4">
          {/* Left side: Artist info and description */}
          <div className="flex-1">
            {/* Artist */}
            <Link
              href={`/artists/${mini.artist.id}`}
              className="flex items-center gap-2 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              {mini.artist.avatar_url ? (
                <img
                  src={mini.artist.avatar_url}
                  alt={mini.artist.name}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-600 border-2 border-white" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">{mini.artist.name}</span>
                  {mini.artist.verified && <span className="text-blue-500">✓</span>}
                </div>
              </div>
            </Link>

            {/* Title and description */}
            <h3 className="text-white font-semibold mb-1">{mini.title}</h3>
            {mini.description && (
              <p className="text-white/90 text-sm line-clamp-2">{mini.description}</p>
            )}
          </div>

          {/* Right side: Action buttons */}
          <div className="flex flex-col gap-6 items-center">
            {/* Like */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onLike) onLike();
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="bg-gray-800/50 backdrop-blur rounded-full p-3">
                <FiHeart size={28} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(mini.likes_count || 0)}
              </span>
            </button>

            {/* Comment */}
            <Link
              href={`/minis/${mini.id}`}
              className="flex flex-col items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-800/50 backdrop-blur rounded-full p-3">
                <FiMessageCircle size={28} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(0)}
              </span>
            </Link>

            {/* Share */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onShare) onShare();
              }}
              className="flex flex-col items-center gap-1"
            >
              <div className="bg-gray-800/50 backdrop-blur rounded-full p-3">
                <FiShare2 size={28} className="text-white" />
              </div>
              <span className="text-white text-xs font-semibold">
                {formatCount(mini.shares_count || 0)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Swipe indicators */}
      {onPrevious && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-64 pointer-events-none">
          <div className="text-white/30 text-sm">Swipe up for previous</div>
        </div>
      )}
      {onNext && (
        <div className="absolute bottom-64 left-1/2 transform -translate-x-1/2 pointer-events-none">
          <div className="text-white/30 text-sm">Swipe down for next</div>
        </div>
      )}
    </div>
  );
}

