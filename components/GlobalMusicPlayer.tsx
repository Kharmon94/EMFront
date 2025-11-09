'use client';

import { MusicPlayer } from './MusicPlayer';
import { MusicPlayerErrorBoundary } from './MusicPlayerErrorBoundary';

export function GlobalMusicPlayer() {
  return (
    <MusicPlayerErrorBoundary>
      <MusicPlayer />
    </MusicPlayerErrorBoundary>
  );
}

