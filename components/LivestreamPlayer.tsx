'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface LivestreamPlayerProps {
  hlsUrl: string;
  isLive: boolean;
  poster?: string;
}

export default function LivestreamPlayer({ hlsUrl, isLive, poster }: LivestreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    setLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      // Use HLS.js for browsers that don't support HLS natively
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded');
        setLoading(false);
        // Auto-play when live
        if (isLive) {
          video.play().catch(err => {
            console.error('Autoplay failed:', err);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Network error - retrying...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Media error - recovering...');
              hls.recoverMediaError();
              break;
            default:
              setError('Fatal error - cannot play stream');
              hls.destroy();
              break;
          }
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = hlsUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        if (isLive) {
          video.play().catch(err => {
            console.error('Autoplay failed:', err);
          });
        }
      });
      video.addEventListener('error', () => {
        setError('Error loading stream');
      });
    } else {
      setError('HLS not supported in this browser');
      setLoading(false);
    }
  }, [hlsUrl, isLive]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        poster={poster}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white text-sm">Loading stream...</div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90">
          <div className="text-center px-4">
            <div className="text-red-500 text-lg font-semibold mb-2">⚠️ Error</div>
            <div className="text-white text-sm">{error}</div>
          </div>
        </div>
      )}
      
      {isLive && !loading && !error && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full"></span>
          LIVE
        </div>
      )}
    </div>
  );
}

