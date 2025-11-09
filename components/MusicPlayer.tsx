'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiShuffle, FiRepeat, FiList, FiSettings, FiFileText, FiHeart, FiMoreVertical, FiMaximize2 } from 'react-icons/fi';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/lib/store/playerStore';
import { QueueDrawer } from './QueueDrawer';
import { AudioSettings } from './AudioSettings';
import { LyricsPanel } from './LyricsPanel';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffle,
    repeatMode,
    playbackSpeed,
    queue,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playNext,
    playPrevious,
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamLogTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamLoggedRef = useRef(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    audioRef.current = new Audio();
    
    const audio = audioRef.current;
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleError = (e: ErrorEvent) => {
      // Only show error if we actually have a track loaded
      if (audio.src) {
        console.error('Audio playback error');
        toast.error('Failed to load track');
      }
    };
    
    // Audio event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('error', handleError as any);
    
    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleTrackEnd);
      audio.removeEventListener('error', handleError as any);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch(e.key.toLowerCase()) {
        case ' ': // Spacebar to play/pause
          e.preventDefault();
          if (currentTrack) {
            handleTogglePlay();
          }
          break;
        case 'arrowright': // Right arrow to skip forward 10s
          e.preventDefault();
          if (audioRef.current && currentTrack) {
            audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration);
          }
          break;
        case 'arrowleft': // Left arrow to skip backward 10s
          e.preventDefault();
          if (audioRef.current && currentTrack) {
            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
          }
          break;
        case 'arrowup': // Up arrow to increase volume
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          break;
        case 'arrowdown': // Down arrow to decrease volume
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        case 'n': // N for next track
          e.preventDefault();
          if (currentTrack) {
            playNext();
          }
          break;
        case 'p': // P for previous track
          e.preventDefault();
          if (currentTrack) {
            playPrevious();
          }
          break;
        case 's': // S to toggle shuffle
          e.preventDefault();
          if (currentTrack) {
            toggleShuffle();
            toast.success(`Shuffle ${!isShuffle ? 'on' : 'off'}`);
          }
          break;
        case 'r': // R to cycle repeat mode
          e.preventDefault();
          if (currentTrack) {
            toggleRepeat();
            const modes = { off: 'Off', all: 'All', one: 'One' };
            const newMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
            toast.success(`Repeat: ${modes[newMode]}`);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTrack, isPlaying, volume, isShuffle, repeatMode, duration]);

  // Load track when currentTrack changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      loadTrack(currentTrack);
    }
  }, [currentTrack]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // Playback speed control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Log stream after 30 seconds (threshold for payout)
  useEffect(() => {
    if (isPlaying && currentTrack && !streamLoggedRef.current) {
      streamLogTimeoutRef.current = setTimeout(() => {
        logStream(currentTrack);
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (streamLogTimeoutRef.current) {
        clearTimeout(streamLogTimeoutRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  const loadTrack = async (track: any) => {
    if (!audioRef.current) return;
    
    try {
      // Get streaming URL from API (includes access checking)
      const response = await api.streamTrack(track.id);
      const streamUrl = response.url;
      const access = response.access;
      
      if (!streamUrl) {
        toast.error('No audio URL available');
        return;
      }
      
      // Show access tier badge
      if (access) {
        if (access.tier === 'premium') {
          toast.success('💎 Lossless quality - NFT holder', { duration: 2000 });
        } else if (access.tier === 'preview') {
          toast('👀 30-second preview - Buy NFT for full track', { 
            icon: '⚠️',
            duration: 4000 
          });
        } else if (access.tier === 'free') {
          toast.success('🎵 Free streaming by artist', { duration: 2000 });
        }
      }
      
      audioRef.current.src = streamUrl;
      streamLoggedRef.current = false;
      
      if (isPlaying) {
        await audioRef.current.play();
      }
    } catch (error: any) {
      console.error('Failed to load track:', error);
      
      // Handle NFT-gated tracks
      if (error.response?.status === 403) {
        toast.error('🔒 NFT ownership required for this track', { duration: 4000 });
      } else {
        toast.error('Failed to load track');
      }
    }
  };

  const logStream = async (track: any) => {
    try {
      const duration = Math.floor(currentTime);
      await api.logStream(track.id, duration);
      streamLoggedRef.current = true;
      console.log(`Stream logged for ${track.title} (${duration}s)`);
    } catch (error) {
      console.error('Failed to log stream:', error);
    }
  };

  const handleTogglePlay = async () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Playback error:', error);
        toast.error('Playback failed');
      }
    }
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
    
    if (repeatMode === 'one' && currentTrack) {
      // Replay current track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Play next track from store
      playNext();
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Toggle mute
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

  // Toggle like
  const handleToggleLike = async () => {
    if (!currentTrack) return;
    
    try {
      if (isLiked) {
        await api.delete(`/tracks/${currentTrack.id}/unlike`);
        setIsLiked(false);
        toast.success('Removed from liked songs');
      } else {
        await api.post(`/tracks/${currentTrack.id}/like`);
        setIsLiked(true);
        toast.success('Added to liked songs');
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // Check if track is liked
  useEffect(() => {
    if (currentTrack) {
      api.get(`/tracks/${currentTrack.id}/is_liked`)
        .then(response => setIsLiked(response.data?.is_liked || false))
        .catch(() => setIsLiked(false));
    }
  }, [currentTrack]);

  if (!currentTrack) {
    return null; // No track loaded
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Compact Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 shadow-2xl">
        {/* Progress bar - Full width, clickable */}
        <div 
          className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 cursor-pointer group relative hover:h-2 transition-all"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            seek(percentage * duration);
          }}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white dark:bg-gray-100 border-2 border-purple-600 rounded-full opacity-0 group-hover:opacity-100 shadow-lg transition-opacity"
            style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
          />
        </div>

        <div className="max-w-full px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            {/* Left: Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0 max-w-[30%]">
              {currentTrack.album.cover_url && (
                <div className="relative group flex-shrink-0">
                  <img 
                    src={currentTrack.album.cover_url} 
                    alt={currentTrack.album.title}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover shadow-lg"
                  />
                  <Link
                    href={`/music/albums/${currentTrack.album.id}`}
                    className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <FiMaximize2 className="w-5 h-5 text-white" />
                  </Link>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <Link 
                  href={`/music/albums/${currentTrack.album.id}`}
                  className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate hover:underline block"
                >
                  {currentTrack.title}
                </Link>
                <Link
                  href={`/artists/${currentTrack.artist.id}`}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate hover:underline block"
                >
                  {currentTrack.artist.name}
                  {currentTrack.artist.verified && (
                    <span className="ml-1 text-blue-500">✓</span>
                  )}
                </Link>
              </div>
              
              {/* Like Button (mobile & desktop) */}
              <button
                onClick={handleToggleLike}
                className={`p-2 rounded-full transition-all flex-shrink-0 ${
                  isLiked 
                    ? 'text-red-500 hover:scale-110' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-red-500 hover:scale-110'
                }`}
                aria-label={isLiked ? 'Unlike' : 'Like'}
              >
                <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Shuffle (desktop only) */}
                <button
                  onClick={() => {
                    toggleShuffle();
                    toast.success(`Shuffle ${!isShuffle ? 'on' : 'off'}`);
                  }}
                  className={`hidden md:block p-2 rounded-full transition-all ${
                    isShuffle 
                      ? 'text-green-500 bg-green-500/10' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label="Shuffle"
                  title={`Shuffle: ${isShuffle ? 'On' : 'Off'}`}
                >
                  <FiShuffle className="w-4 h-4" />
                </button>

                {/* Previous */}
                <button
                  onClick={playPrevious}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-all"
                  aria-label="Previous track"
                >
                  <FiSkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={handleTogglePlay}
                  className="p-3 sm:p-4 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <FiPause className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <FiPlay className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={playNext}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-all"
                  aria-label="Next track"
                >
                  <FiSkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Repeat (desktop only) */}
                <button
                  onClick={() => {
                    toggleRepeat();
                    const modes = { off: 'Off', all: 'All', one: 'One' };
                    const newMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off';
                    toast.success(`Repeat: ${modes[newMode]}`);
                  }}
                  className={`hidden md:block p-2 rounded-full transition-all relative ${
                    repeatMode !== 'off' 
                      ? 'text-green-500 bg-green-500/10' 
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label="Repeat"
                  title={`Repeat: ${repeatMode === 'off' ? 'Off' : repeatMode === 'all' ? 'All' : 'One'}`}
                >
                  <FiRepeat className="w-4 h-4" />
                  {repeatMode === 'one' && (
                    <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-green-600 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">1</span>
                  )}
                </button>
              </div>

              {/* Time Display (desktop) */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 tabular-nums">
                <span>{formatDuration(Math.floor(currentTime))}</span>
                <span className="text-gray-400 dark:text-gray-600">/</span>
                <span>{formatDuration(Math.floor(duration))}</span>
              </div>
            </div>

            {/* Right: Secondary Controls */}
            <div className="flex items-center gap-2 sm:gap-3 justify-end flex-1 max-w-[30%]">
              {/* Queue Button */}
              <button
                onClick={() => setQueueOpen(true)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all relative"
                aria-label="Queue"
                title="View Queue"
              >
                <FiList className="w-4 h-4 sm:w-5 sm:h-5" />
                {queue.length > 1 && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-purple-600 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold px-1">
                    {queue.length}
                  </span>
                )}
              </button>

              {/* Lyrics Button (desktop) */}
              <button
                onClick={() => setLyricsOpen(true)}
                className="hidden lg:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                aria-label="Lyrics"
                title="Show Lyrics"
              >
                <FiFileText className="w-5 h-5" />
              </button>
              
              {/* Settings Button (desktop only) */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="hidden lg:block p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                aria-label="Audio Settings"
                title="Audio Settings"
              >
                <FiSettings className="w-5 h-5" />
              </button>

              {/* Volume (desktop only) */}
              <div className="hidden lg:flex items-center gap-2 w-28">
                <button
                  onClick={handleToggleMute}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
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
                  className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:accent-purple-700"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${(isMuted ? 0 : volume) * 100}%, ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'} ${(isMuted ? 0 : volume) * 100}%, ${document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb'} 100%)`
                  }}
                />
              </div>

              {/* More Options (Mobile) */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"
                aria-label="More Options"
              >
                <FiMoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Queue Drawer */}
      <QueueDrawer isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
      
      {/* Audio Settings */}
      <AudioSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      
      {/* Lyrics Panel */}
      {currentTrack && (
        <LyricsPanel
          trackId={currentTrack.id}
          isOpen={lyricsOpen}
          onClose={() => setLyricsOpen(false)}
        />
      )}
    </>
  );
}

// Player store is exported from @/lib/store/playerStore
export { usePlayerStore } from '@/lib/store/playerStore';

