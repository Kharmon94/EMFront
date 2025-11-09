'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown, FiMoreVertical, FiHeart, FiPlay, FiPause, FiSkipBack, FiSkipForward, FiShuffle, FiRepeat, FiVolume2, FiVolumeX, FiList, FiShare2, FiPlus } from 'react-icons/fi';
import { usePlayerStore } from '@/lib/store/playerStore';
import { formatDuration } from '@/lib/utils';
import { QueueDrawer } from './QueueDrawer';
import { AudioSettings } from './AudioSettings';
import { LyricsPanel } from './LyricsPanel';
import { ShareModal } from './ShareModal';
import { AddToPlaylistModal } from './AddToPlaylistModal';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FullPlayerPageProps {
  isOpen: boolean;
  onClose: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  isLoading: boolean;
  isBuffering: boolean;
}

export function FullPlayerPage({ isOpen, onClose, onTogglePlay, onSeek, isLoading, isBuffering }: FullPlayerPageProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    setCurrentTime,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
  } = usePlayerStore();

  const [queueOpen, setQueueOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [albumArtKey, setAlbumArtKey] = useState(0);
  const [trackInfoKey, setTrackInfoKey] = useState(0);

  // Check if track is liked
  useEffect(() => {
    if (currentTrack) {
      api.get(`/tracks/${currentTrack.id}/is_liked`)
        .then(response => setIsLiked(response.data?.is_liked || false))
        .catch(() => setIsLiked(false));
    }
  }, [currentTrack]);

  // Announce track changes for screen readers and trigger animations
  useEffect(() => {
    if (currentTrack && isOpen) {
      setAnnouncement(`Now playing ${currentTrack.title} by ${currentTrack.artist.name}`);
      // Trigger animations on track change
      setAlbumArtKey(prev => prev + 1);
      setTrackInfoKey(prev => prev + 1);
    }
  }, [currentTrack, isOpen]);

  const handleToggleLike = async () => {
    if (!currentTrack) return;
    
    try {
      if (isLiked) {
        await api.delete(`/tracks/${currentTrack.id}/like`);
        setIsLiked(false);
        toast.success('Removed from liked songs');
      } else {
        await api.post(`/tracks/${currentTrack.id}/like`);
        setIsLiked(true);
        toast.success('Added to liked songs');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      toast.error('Failed to update like status');
    }
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    onSeek(percentage * duration);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!currentTrack || !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b from-purple-900/95 via-gray-900/95 to-black/95 backdrop-blur-xl z-[60] transition-all duration-500 ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{
        backgroundImage: currentTrack.album.cover_url 
          ? `linear-gradient(to bottom, rgba(88, 28, 135, 0.95), rgba(17, 24, 39, 0.95), rgba(0, 0, 0, 0.95)), url(${currentTrack.album.cover_url})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* ARIA Live Region for Screen Readers */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 z-10">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Buffering...
        </div>
      )}

      {/* Header */}
      <div className="safe-top px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if ('vibrate' in navigator) navigator.vibrate(5);
            }}
            className="p-2 hover:bg-white/10 active:scale-90 rounded-full transition-all touch-manipulation"
            aria-label="Close full player"
          >
            <FiChevronDown className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </button>
          
          <div className="flex-1 text-center px-2">
            <p className="text-xs text-gray-300 uppercase tracking-wider mb-0.5">Playing from</p>
            <Link href={`/albums/${currentTrack.album.id}`} className="text-xs sm:text-sm text-white font-medium hover:underline truncate block">
              {currentTrack.album.title}
            </Link>
          </div>

          <button
            onClick={() => {
              setSettingsOpen(true);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="p-2 hover:bg-white/10 active:scale-90 rounded-full transition-all touch-manipulation"
            aria-label="Audio settings"
          >
            <FiMoreVertical className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </button>
        </div>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-4 sm:py-8">
        <div key={albumArtKey} className="relative w-full max-w-sm sm:max-w-md aspect-square animate-fadeIn">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl sm:rounded-3xl blur-2xl sm:blur-3xl animate-pulse" />
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transform transition-transform active:scale-95 sm:hover:scale-105">
            {currentTrack.album.cover_url ? (
              <img
                src={currentTrack.album.cover_url}
                alt={currentTrack.album.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-7xl sm:text-9xl font-bold text-white/20">
                  {currentTrack.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Song Info & Controls */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8 space-y-4 sm:space-y-6">
        {/* Track Info */}
        <div key={trackInfoKey} className="flex items-start justify-between gap-3 sm:gap-4 animate-fadeIn">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate mb-1">
              {currentTrack.title}
            </h2>
            <Link 
              href={`/artists/${currentTrack.artist.id}`}
              className="text-base sm:text-lg text-gray-300 hover:text-white transition-colors truncate block active:scale-95 touch-manipulation"
            >
              {currentTrack.artist.name}
              {currentTrack.artist.verified && (
                <span className="ml-1 text-blue-400">✓</span>
              )}
            </Link>
          </div>

          <button
            onClick={() => {
              handleToggleLike();
              if ('vibrate' in navigator) navigator.vibrate(isLiked ? 5 : 15);
            }}
            className="p-2 flex-shrink-0 active:scale-90 transition-transform touch-manipulation"
            aria-label={isLiked ? 'Unlike track' : 'Like track'}
          >
            <FiHeart 
              className={`w-7 h-7 sm:w-8 sm:h-8 transition-all ${
                isLiked 
                  ? 'text-red-500 fill-current scale-110 animate-pulse' 
                  : 'text-gray-300 hover:text-white hover:scale-110'
              }`}
            />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="relative h-1 sm:h-1.5 bg-white/20 rounded-full cursor-pointer group py-2 -my-2 touch-manipulation"
            onClick={handleSeek}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleSeek(e);
              if ('vibrate' in navigator) navigator.vibrate(5);
            }}
            onTouchMove={(e) => {
              if (isDragging) {
                e.preventDefault();
                handleSeek(e);
              }
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
          >
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 sm:h-1.5 bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full shadow-lg transition-all ${
                isDragging ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}
              style={{ 
                left: `${progress}%`, 
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-300 tabular-nums">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-2 sm:px-4">
          <button
            onClick={() => {
              toggleShuffle();
              toast.success(`Shuffle ${!isShuffle ? 'on' : 'off'}`);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className={`p-2 sm:p-3 transition-all active:scale-90 touch-manipulation ${
              isShuffle ? 'text-purple-400' : 'text-gray-300 hover:text-white'
            }`}
            aria-label={`Shuffle ${isShuffle ? 'on' : 'off'}`}
          >
            <FiShuffle className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => {
              // If more than 3 seconds in, restart track
              if (currentTime > 3) {
                onSeek(0);
                toast.success('Restarting track');
              } else {
                playPrevious();
              }
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="p-3 sm:p-4 text-white hover:scale-110 active:scale-95 transition-transform touch-manipulation"
            aria-label="Previous track"
          >
            <FiSkipBack className="w-8 h-8 sm:w-9 sm:h-9" />
          </button>

          <button
            onClick={() => {
              onTogglePlay();
              if ('vibrate' in navigator) navigator.vibrate(15);
            }}
            className="p-4 sm:p-5 bg-white hover:bg-gray-100 active:scale-95 rounded-full text-black shadow-2xl hover:scale-105 transition-all relative touch-manipulation"
            disabled={isLoading}
            aria-label={isBuffering ? 'Buffering' : isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading || isBuffering ? (
              <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
            ) : isPlaying ? (
              <FiPause className="w-9 h-9 sm:w-10 sm:h-10" />
            ) : (
              <FiPlay className="w-9 h-9 sm:w-10 sm:h-10 ml-1" />
            )}
          </button>

          <button
            onClick={() => {
              playNext();
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="p-3 sm:p-4 text-white hover:scale-110 active:scale-95 transition-transform touch-manipulation"
            aria-label="Next track"
          >
            <FiSkipForward className="w-8 h-8 sm:w-9 sm:h-9" />
          </button>

          <button
            onClick={() => {
              toggleRepeat();
              const modes = { off: 'Off', all: 'All', one: 'One' };
              const newMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
              toast.success(`Repeat: ${modes[newMode]}`);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className={`p-2 sm:p-3 transition-all active:scale-90 relative touch-manipulation ${
              repeatMode !== 'off' ? 'text-purple-400' : 'text-gray-300 hover:text-white'
            }`}
            aria-label={`Repeat: ${repeatMode}`}
          >
            <FiRepeat className="w-5 h-5 sm:w-6 sm:h-6" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-xs bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                1
              </span>
            )}
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6">
          <button
            onClick={() => {
              handleToggleMute();
              if ('vibrate' in navigator) navigator.vibrate(5);
            }}
            className="text-gray-300 hover:text-white transition-colors touch-manipulation p-2 active:scale-90"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <FiVolumeX className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <FiVolume2 className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
          
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseFloat(e.target.value);
              setVolume(newVolume);
              setIsMuted(newVolume === 0);
            }}
            className="flex-1 h-1 sm:h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer touch-manipulation"
            style={{
              background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
            aria-label="Volume"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-around pb-safe px-2">
          <button
            onClick={() => {
              setShareOpen(true);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="p-3 sm:p-4 text-gray-300 hover:text-white active:scale-90 transition-all touch-manipulation"
            title="Share"
            aria-label="Share track"
          >
            <FiShare2 className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={() => {
              setPlaylistOpen(true);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="p-3 sm:p-4 text-gray-300 hover:text-white active:scale-90 transition-all touch-manipulation"
            title="Add to Playlist"
            aria-label="Add to playlist"
          >
            <FiPlus className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={() => {
              setLyricsOpen(true);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="p-3 sm:p-4 text-gray-300 hover:text-white active:scale-90 transition-all touch-manipulation"
            title="Lyrics"
            aria-label="Show lyrics"
          >
            <div className="relative">
              <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-current rounded flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold">♪</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setQueueOpen(true);
              if ('vibrate' in navigator) navigator.vibrate(10);
            }}
            className="p-3 sm:p-4 text-gray-300 hover:text-white active:scale-90 transition-all relative touch-manipulation"
            title="Queue"
            aria-label="View queue"
          >
            <FiList className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <QueueDrawer isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
      <AudioSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {currentTrack && (
        <>
          <LyricsPanel
            trackId={currentTrack.id}
            isOpen={lyricsOpen}
            onClose={() => setLyricsOpen(false)}
          />
          <ShareModal
            isOpen={shareOpen}
            onClose={() => setShareOpen(false)}
            url={`/tracks/${currentTrack.id}`}
            title={currentTrack.title}
            description={currentTrack.artist.name}
            type="track"
          />
          <AddToPlaylistModal
            isOpen={playlistOpen}
            onClose={() => setPlaylistOpen(false)}
            trackId={currentTrack.id}
            trackTitle={currentTrack.title}
          />
        </>
      )}
    </div>
  );
}

