import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Track {
  id: number;
  title: string;
  duration: number;
  audio_url?: string;
  album: {
    id: number;
    title: string;
    cover_url?: string;
  };
  artist: {
    id: number;
    name: string;
  };
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  
  // Actions
  setCurrentTrack: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  playNext: () => void;
  playPrevious: () => void;
  clearQueue: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      volume: 1,
      isShuffle: false,
      repeatMode: 'off',
      
      setCurrentTrack: (track) => set({ currentTrack: track }),
      
      setQueue: (tracks) => set({ queue: tracks }),
      
      addToQueue: (track) => set((state) => ({
        queue: [...state.queue, track]
      })),
      
      removeFromQueue: (trackId) => set((state) => ({
        queue: state.queue.filter(t => t.id !== trackId)
      })),
      
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      
      setVolume: (volume) => set({ volume }),
      
      toggleShuffle: () => set((state) => ({
        isShuffle: !state.isShuffle,
        queue: !state.isShuffle 
          ? [...state.queue].sort(() => Math.random() - 0.5)
          : state.queue
      })),
      
      toggleRepeat: () => set((state) => ({
        repeatMode: state.repeatMode === 'off' ? 'all' 
                  : state.repeatMode === 'all' ? 'one' 
                  : 'off'
      })),
      
      playNext: () => {
        const { queue, currentTrack, repeatMode } = get();
        if (queue.length === 0) return;
        
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        let nextIndex = currentIndex + 1;
        
        if (nextIndex >= queue.length) {
          nextIndex = repeatMode === 'all' ? 0 : currentIndex;
        }
        
        if (nextIndex < queue.length) {
          set({ currentTrack: queue[nextIndex] });
        }
      },
      
      playPrevious: () => {
        const { queue, currentTrack, repeatMode } = get();
        if (queue.length === 0) return;
        
        const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
        let prevIndex = currentIndex - 1;
        
        if (prevIndex < 0) {
          prevIndex = repeatMode === 'all' ? queue.length - 1 : 0;
        }
        
        set({ currentTrack: queue[prevIndex] });
      },
      
      clearQueue: () => set({ queue: [], currentTrack: null }),
    }),
    {
      name: 'music-player-storage',
      partialize: (state) => ({
        volume: state.volume,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
      }),
    }
  )
);

