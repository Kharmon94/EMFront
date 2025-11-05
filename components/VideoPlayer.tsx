'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize } from 'react-icons/fi';
import api from '@/lib/api';

interface VideoPlayerProps {
  videoId: number;
  videoUrl: string;
  duration: number;
  accessTier: string;
  durationAllowed?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export default function VideoPlayer({
  videoId,
  videoUrl,
  duration,
  accessTier,
  durationAllowed,
  onTimeUpdate,
  onEnded
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasLoggedView, setHasLoggedView] = useState(false);

  // Log view after watching 10 seconds
  useEffect(() => {
    if (currentTime > 10 && !hasLoggedView) {
      api.logVideoView(videoId, Math.floor(currentTime), accessTier)
        .then(() => setHasLoggedView(true))
        .catch(console.error);
    }
  }, [currentTime, videoId, accessTier, hasLoggedView]);

  // Preview duration limit
  useEffect(() => {
    if (durationAllowed && currentTime >= durationAllowed) {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      if (onEnded) {
        onEnded();
      }
    }
  }, [currentTime, durationAllowed, onEnded]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (onTimeUpdate) {
        onTimeUpdate(time);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5;
        setVolume(volume || 0.5);
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />
      
      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max={durationAllowed || duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 mb-3 bg-gray-600 rounded-lg appearance-none cursor-pointer"
        />
        
        {/* Controls */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="hover:text-purple-400 transition-colors"
            >
              {isPlaying ? <FiPause size={24} /> : <FiPlay size={24} />}
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="hover:text-purple-400 transition-colors"
              >
                {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <span className="text-sm">
              {formatTime(currentTime)} / {formatTime(durationAllowed || duration)}
            </span>
          </div>
          
          <button
            onClick={toggleFullscreen}
            className="hover:text-purple-400 transition-colors"
          >
            <FiMaximize size={20} />
          </button>
        </div>
        
        {/* Preview warning */}
        {durationAllowed && currentTime > durationAllowed * 0.8 && (
          <div className="mt-2 text-center text-sm text-yellow-400">
            Preview ending soon. Purchase to continue watching.
          </div>
        )}
      </div>
    </div>
  );
}

