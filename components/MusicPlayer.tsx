'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiSkipForward, FiChevronUp } from 'react-icons/fi';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/lib/store/playerStore';
import { FullPlayerPage } from './FullPlayerPage';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackSpeed,
    isShuffle,
    repeatMode,
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
  const [fullPlayerOpen, setFullPlayerOpen] = useState(false);

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

  if (!currentTrack) {
    return null; // No track loaded
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Mini Player - Clickable to expand */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 shadow-2xl md:pb-0 pb-safe"
        onClick={() => setFullPlayerOpen(true)}
      >
        {/* Progress bar - Full width, thin */}
        <div 
          className="w-full h-1 bg-gray-200 dark:bg-gray-800 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            seek(percentage * duration);
          }}
        >
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Album Art - Clickable */}
            {currentTrack.album.cover_url && (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md cursor-pointer">
                <img 
                  src={currentTrack.album.cover_url} 
                  alt={currentTrack.album.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Track Info - Clickable to expand */}
            <div className="flex-1 min-w-0 cursor-pointer">
              <div className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                {currentTrack.title}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {currentTrack.artist.name}
                {currentTrack.artist.verified && (
                  <span className="ml-1 text-blue-500">✓</span>
                )}
              </div>
            </div>

            {/* Controls - Prevent expand on click */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              {/* Play/Pause */}
              <button
                onClick={handleTogglePlay}
                className="p-2 sm:p-2.5 text-gray-900 dark:text-white hover:scale-105 transition-all"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <FiPause className="w-7 h-7 sm:w-8 sm:h-8" />
                ) : (
                  <FiPlay className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
                aria-label="Next track"
              >
                <FiSkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>

              {/* Expand Icon (always visible) */}
              <button
                onClick={() => setFullPlayerOpen(true)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
                aria-label="Expand player"
                title="Open full player"
              >
                <FiChevronUp className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Full Player Page */}
      <FullPlayerPage 
        isOpen={fullPlayerOpen} 
        onClose={() => setFullPlayerOpen(false)}
        onTogglePlay={handleTogglePlay}
        onSeek={seek}
      />
    </>
  );
}

// Player store is exported from @/lib/store/playerStore
export { usePlayerStore } from '@/lib/store/playerStore';

