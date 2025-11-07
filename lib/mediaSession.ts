// Media Session API for background play and lock screen controls

interface TrackInfo {
  title: string;
  artist: string;
  album: string;
  artwork?: string;
}

export class MediaSessionManager {
  private static instance: MediaSessionManager;

  private constructor() {
    this.setupMediaSession();
  }

  public static getInstance(): MediaSessionManager {
    if (!MediaSessionManager.instance) {
      MediaSessionManager.instance = new MediaSessionManager();
    }
    return MediaSessionManager.instance;
  }

  private setupMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        window.dispatchEvent(new CustomEvent('media-session-play'));
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        window.dispatchEvent(new CustomEvent('media-session-pause'));
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        window.dispatchEvent(new CustomEvent('media-session-previous'));
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        window.dispatchEvent(new CustomEvent('media-session-next'));
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        window.dispatchEvent(new CustomEvent('media-session-seekbackward', {
          detail: { seekOffset: details.seekOffset || 10 }
        }));
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        window.dispatchEvent(new CustomEvent('media-session-seekforward', {
          detail: { seekOffset: details.seekOffset || 10 }
        }));
      });
    }
  }

  public updateMetadata(track: TrackInfo) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album,
        artwork: track.artwork ? [
          { src: track.artwork, sizes: '96x96', type: 'image/jpeg' },
          { src: track.artwork, sizes: '128x128', type: 'image/jpeg' },
          { src: track.artwork, sizes: '192x192', type: 'image/jpeg' },
          { src: track.artwork, sizes: '256x256', type: 'image/jpeg' },
          { src: track.artwork, sizes: '384x384', type: 'image/jpeg' },
          { src: track.artwork, sizes: '512x512', type: 'image/jpeg' },
        ] : []
      });
    }
  }

  public updatePlaybackState(state: 'none' | 'paused' | 'playing') {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  public updatePosition(duration: number, currentTime: number, playbackRate: number = 1.0) {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate,
          position: currentTime
        });
      } catch (error) {
        console.error('Failed to update position state:', error);
      }
    }
  }
}

export const mediaSession = MediaSessionManager.getInstance();

