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
  queueHistory: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  crossfade: number;
  playbackSpeed: number;
  
  // Actions
  setCurrentTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  playTrack: (track: Track, queue?: Track[]) => void;
  addToQueue: (track: Track) => void;
  playNext: () => void;
  playPrevious: () => void;
  playTrackNext: (track: Track) => void; // Insert track to play next
  removeFromQueue: (trackId: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setCrossfade: (seconds: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueHistory: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isShuffle: false,
  repeatMode: 'off',
  crossfade: 0,
  playbackSpeed: 1.0,
  
  setCurrentTrack: (track) => set({ currentTrack: track }),
  
  setQueue: (tracks) => set({ queue: tracks }),
  
  playTrack: (track, queue) => {
    const state = get();
    // Add current track to history if it exists
    if (state.currentTrack) {
      const newHistory = [state.currentTrack, ...state.queueHistory].slice(0, 50);
      set({ queueHistory: newHistory });
    }
    
    set({
      currentTrack: track,
      queue: queue || [track],
      isPlaying: true,
      currentTime: 0,
    });
    
    // Save queue to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_queue', JSON.stringify(queue || [track]));
      localStorage.setItem('current_track', JSON.stringify(track));
    }
  },
  
  addToQueue: (track) => {
    const state = get();
    const newQueue = [...state.queue, track];
    set({ queue: newQueue });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_queue', JSON.stringify(newQueue));
    }
  },
  
  playTrackNext: (track) => {
    const state = get();
    const currentIndex = state.queue.findIndex(t => t.id === state.currentTrack?.id);
    const newQueue = [
      ...state.queue.slice(0, currentIndex + 1),
      track,
      ...state.queue.slice(currentIndex + 1)
    ];
    set({ queue: newQueue });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_queue', JSON.stringify(newQueue));
    }
  },
  
  removeFromQueue: (trackId) => {
    const state = get();
    const newQueue = state.queue.filter(t => t.id !== trackId);
    set({ queue: newQueue });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_queue', JSON.stringify(newQueue));
    }
  },
  
  reorderQueue: (fromIndex, toIndex) => {
    const state = get();
    const newQueue = [...state.queue];
    const [removed] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, removed);
    set({ queue: newQueue });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('player_queue', JSON.stringify(newQueue));
    }
  },
  
  clearQueue: () => {
    set({ queue: [], currentTrack: null, isPlaying: false });
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('player_queue');
      localStorage.removeItem('current_track');
    }
  },
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => set({ volume }),
  
  setCrossfade: (seconds) => set({ crossfade: seconds }),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  toggleShuffle: () => {
    const state = get();
    const newShuffle = !state.isShuffle;
    
    if (newShuffle) {
      // Smart shuffle: prioritize liked tracks (placeholder for now)
      const currentTrack = state.currentTrack;
      const currentIndex = state.queue.findIndex(t => t.id === currentTrack?.id);
      
      // Keep everything before current track in order
      const played = state.queue.slice(0, currentIndex + 1);
      
      // Shuffle the rest
      const unplayed = state.queue.slice(currentIndex + 1).sort(() => Math.random() - 0.5);
      
      set({ isShuffle: newShuffle, queue: [...played, ...unplayed] });
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

