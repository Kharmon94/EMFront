import { create } from 'zustand';

interface Track {
  id: number;
  title: string;
  duration: number;
  audio_url?: string;
  audio_cid?: string;
  album: {
    id: number;
    title: string;
    cover_url?: string;
  };
  artist: {
    id: number;
    name: string;
    verified?: boolean;
  };
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  
  // Actions
  setCurrentTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isShuffle: false,
  repeatMode: 'off',
  
  setCurrentTrack: (track) => set({ currentTrack: track }),
  
  setQueue: (tracks) => set({ queue: tracks }),
  
  playTrack: (track, queue) => {
    set({
      currentTrack: track,
      queue: queue || [track],
      isPlaying: true,
      currentTime: 0,
    });
  },
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => set({ volume }),
  
  toggleShuffle: () => {
    const state = get();
    const newShuffle = !state.isShuffle;
    
    if (newShuffle) {
      // Shuffle the queue
      const shuffled = [...state.queue].sort(() => Math.random() - 0.5);
      set({ isShuffle: newShuffle, queue: shuffled });
    } else {
      set({ isShuffle: newShuffle });
    }
  },
  
  toggleRepeat: () => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(get().repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    set({ repeatMode: modes[nextIndex] });
  },
  
  playNext: () => {
    const state = get();
    if (state.queue.length === 0) return;
    
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= state.queue.length) {
      if (state.repeatMode === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }
    
    set({
      currentTrack: state.queue[nextIndex],
      isPlaying: true,
      currentTime: 0,
    });
  },
  
  playPrevious: () => {
    const state = get();
    
    // If more than 3 seconds into track, restart it
    if (state.currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }
    
    if (state.queue.length === 0) return;
    
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      prevIndex = state.repeatMode === 'all' ? state.queue.length - 1 : 0;
    }
    
    set({
      currentTrack: state.queue[prevIndex],
      isPlaying: true,
      currentTime: 0,
    });
  },
  
  clearPlayer: () => set({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    currentTime: 0,
  }),
}));

