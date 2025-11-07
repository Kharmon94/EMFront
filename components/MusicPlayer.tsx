'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiVolume2, FiShuffle, FiRepeat, FiList, FiSettings, FiFileText } from 'react-icons/fi';
import { formatDuration } from '@/lib/utils';
import { usePlayerStore } from '@/lib/store/playerStore';
import { QueueDrawer } from './QueueDrawer';
import { AudioSettings } from './AudioSettings';
import { LyricsPanel } from './LyricsPanel';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
      <div className="max-w-full px-4 py-3">
        {/* Progress bar */}
        <div className="w-full mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <div className="flex-1 relative h-1 bg-gray-700 rounded-full cursor-pointer group"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = e.clientX - rect.left;
                   const percentage = x / rect.width;
                   seek(percentage * duration);
                 }}>
              <div 
                className="absolute top-0 left-0 h-full bg-purple-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
              />
            </div>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack.album.cover_url && (
              <img 
                src={currentTrack.album.cover_url} 
                alt={currentTrack.album.title}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm sm:text-base font-medium text-white truncate">
                {currentTrack.title}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 truncate">
                {currentTrack.artist.name}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Shuffle (desktop only) */}
            <button
              onClick={toggleShuffle}
              className={`hidden sm:block p-2 rounded-full transition-colors ${
                isShuffle ? 'text-purple-500' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Shuffle"
            >
              <FiShuffle className="w-4 h-4" />
            </button>

            {/* Previous */}
            <button
              onClick={playPrevious}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Previous track"
            >
              <FiSkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={handleTogglePlay}
              className="p-3 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <FiPause className="w-5 h-5" />
              ) : (
                <FiPlay className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Next track"
            >
              <FiSkipForward className="w-5 h-5" />
            </button>

            {/* Repeat (desktop only) */}
            <button
              onClick={toggleRepeat}
              className={`hidden sm:block p-2 rounded-full transition-colors relative ${
                repeatMode !== 'off' ? 'text-purple-500' : 'text-gray-400 hover:text-white'
              }`}
              aria-label="Repeat"
            >
              <FiRepeat className="w-4 h-4" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-xs bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center">1</span>
              )}
            </button>
            
            {/* Queue Button */}
            <button
              onClick={() => setQueueOpen(true)}
              className="hidden sm:block p-2 text-gray-400 hover:text-white transition-colors relative"
              aria-label="Queue"
            >
              <FiList className="w-4 h-4" />
              {queue.length > 1 && (
                <span className="absolute -top-1 -right-1 text-xs bg-purple-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>
          </div>

          {/* Lyrics Button */}
          <button
            onClick={() => setLyricsOpen(true)}
            className="hidden sm:block p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Lyrics"
          >
            <FiFileText className="w-4 h-4" />
          </button>
          
          {/* Settings Button (desktop only) */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="hidden sm:block p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Audio Settings"
          >
            <FiSettings className="w-4 h-4" />
          </button>

          {/* Volume (desktop only) */}
          <div className="hidden lg:flex items-center gap-2 w-32">
            <FiVolume2 className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
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
    </div>
  );
}

// Player store is exported from @/lib/store/playerStore
export { usePlayerStore } from '@/lib/store/playerStore';

