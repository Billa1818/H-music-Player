import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useMusicStore = create(
  devtools(
    persist(
      (set, get) => ({
        // État de la musique
        currentTrack: null,
        isPlaying: false,
        duration: 0,
        position: 0,
        queue: [],
        currentIndex: 0,
        volume: 1,
        
        // Favoris et listes
        favorites: [],
        playlists: [],
        
        // Filtres et catégories
        selectedCategory: 'tracks',
        searchQuery: '',
        
        // Actions
        setCurrentTrack: (track) => set({ currentTrack: track }),
        setIsPlaying: (playing) => set({ isPlaying: playing }),
        setPosition: (position) => set({ position }),
        setDuration: (duration) => set({ duration }),
        setQueue: (queue) => set({ queue }),
        setCurrentIndex: (index) => set({ currentIndex: index }),
        setVolume: (volume) => set({ volume }),
        
        addToFavorites: (track) => set((state) => ({
          favorites: [...state.favorites, track]
        })),
        removeFromFavorites: (trackId) => set((state) => ({
          favorites: state.favorites.filter(t => t.id !== trackId)
        })),
        
        createPlaylist: (playlist) => set((state) => ({
          playlists: [...state.playlists, playlist]
        })),
        addTrackToPlaylist: (playlistId, track) => set((state) => ({
          playlists: state.playlists.map(p => 
            p.id === playlistId 
              ? { ...p, tracks: [...(p.tracks || []), track] }
              : p
          )
        })),
        
        setSelectedCategory: (category) => set({ selectedCategory: category }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        
        // Actions de lecture
        playNext: () => set((state) => ({
          currentIndex: Math.min(state.currentIndex + 1, state.queue.length - 1)
        })),
        playPrevious: () => set((state) => ({
          currentIndex: Math.max(state.currentIndex - 1, 0)
        })),
      }),
      {
        name: 'music-storage',
        storage: {
          getItem: async (name) => {
            const item = await AsyncStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          },
          setItem: async (name, value) => {
            await AsyncStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: async (name) => {
            await AsyncStorage.removeItem(name);
          },
        },
      }
    )
  )
);
