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
}

export function FullPlayerPage({ isOpen, onClose, onTogglePlay, onSeek }: FullPlayerPageProps) {
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

  // Check if track is liked
  useEffect(() => {
    if (currentTrack) {
      api.get(`/tracks/${currentTrack.id}/is_liked`)
        .then(response => setIsLiked(response.data?.is_liked || false))
        .catch(() => setIsLiked(false));
    }
  }, [currentTrack]);

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
      {/* Header */}
      <div className="safe-top px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FiChevronDown className="w-7 h-7 text-white" />
          </button>
          
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-300 uppercase tracking-wider">Playing from</p>
            <Link href={`/albums/${currentTrack.album.id}`} className="text-sm text-white font-medium hover:underline">
              {currentTrack.album.title}
            </Link>
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FiMoreVertical className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="relative w-full max-w-md aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            {currentTrack.album.cover_url ? (
              <img
                src={currentTrack.album.cover_url}
                alt={currentTrack.album.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <span className="text-9xl font-bold text-white/20">
                  {currentTrack.title.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Song Info & Controls */}
      <div className="px-6 pb-8 space-y-6">
        {/* Track Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate mb-1">
              {currentTrack.title}
            </h2>
            <Link 
              href={`/artists/${currentTrack.artist.id}`}
              className="text-lg text-gray-300 hover:text-white transition-colors truncate block"
            >
              {currentTrack.artist.name}
              {currentTrack.artist.verified && (
                <span className="ml-1 text-blue-400">✓</span>
              )}
            </Link>
          </div>

          <button
            onClick={handleToggleLike}
            className="p-2 flex-shrink-0"
          >
            <FiHeart 
              className={`w-7 h-7 transition-all ${
                isLiked 
                  ? 'text-red-500 fill-current scale-110' 
                  : 'text-gray-300 hover:text-white hover:scale-110'
              }`}
            />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div
            className="relative h-1 bg-white/20 rounded-full cursor-pointer group"
            onClick={handleSeek}
            onTouchStart={(e) => {
              setIsDragging(true);
              handleSeek(e);
            }}
            onTouchMove={(e) => {
              if (isDragging) {
                e.preventDefault();
                handleSeek(e);
              }
            }}
            onTouchEnd={() => setIsDragging(false)}
          >
            <div
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-300 tabular-nums">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-between px-4">
          <button
            onClick={() => {
              toggleShuffle();
              toast.success(`Shuffle ${!isShuffle ? 'on' : 'off'}`);
            }}
            className={`p-2 transition-all ${
              isShuffle ? 'text-purple-400' : 'text-gray-300'
            }`}
          >
            <FiShuffle className="w-6 h-6" />
          </button>

          <button
            onClick={playPrevious}
            className="p-3 text-white hover:scale-110 transition-transform"
          >
            <FiSkipBack className="w-9 h-9" />
          </button>

          <button
            onClick={onTogglePlay}
            className="p-5 bg-white hover:bg-gray-100 rounded-full text-black shadow-2xl hover:scale-105 transition-all"
          >
            {isPlaying ? (
              <FiPause className="w-10 h-10" />
            ) : (
              <FiPlay className="w-10 h-10 ml-1" />
            )}
          </button>

          <button
            onClick={playNext}
            className="p-3 text-white hover:scale-110 transition-transform"
          >
            <FiSkipForward className="w-9 h-9" />
          </button>

          <button
            onClick={() => {
              toggleRepeat();
              const modes = { off: 'Off', all: 'All', one: 'One' };
              const newMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
              toast.success(`Repeat: ${modes[newMode]}`);
            }}
            className={`p-2 transition-all relative ${
              repeatMode !== 'off' ? 'text-purple-400' : 'text-gray-300'
            }`}
          >
            <FiRepeat className="w-6 h-6" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-xs bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">
                1
              </span>
            )}
          </button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4 px-2">
          <button
            onClick={handleToggleMute}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {isMuted || volume === 0 ? (
              <FiVolumeX className="w-5 h-5" />
            ) : (
              <FiVolume2 className="w-5 h-5" />
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
            className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white 0%, white ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) 100%)`
            }}
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-around pb-safe">
          <button
            onClick={() => setShareOpen(true)}
            className="p-3 text-gray-300 hover:text-white transition-colors"
            title="Share"
          >
            <FiShare2 className="w-6 h-6" />
          </button>

          <button
            onClick={() => setPlaylistOpen(true)}
            className="p-3 text-gray-300 hover:text-white transition-colors"
            title="Add to Playlist"
          >
            <FiPlus className="w-6 h-6" />
          </button>

          <button
            onClick={() => setLyricsOpen(true)}
            className="p-3 text-gray-300 hover:text-white transition-colors"
            title="Lyrics"
          >
            <div className="relative">
              <div className="w-6 h-6 border-2 border-current rounded flex items-center justify-center">
                <span className="text-xs font-bold">♪</span>
              </div>
            </div>
          </button>

          <button
            onClick={() => setQueueOpen(true)}
            className="p-3 text-gray-300 hover:text-white transition-colors relative"
            title="Queue"
          >
            <FiList className="w-6 h-6" />
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

