import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMusicStore } from '../store/musicStore';
import { loadAudioFilesWithMetadata } from '../utils/metadataExtractor';
import { audioService } from '../services/audioService';
import {
  Header,
  MiniPlayer,
  MenuTabs,
  FilterBar,
  TrackCard,
} from '../components';

const HomeScreen = ({ navigation }) => {
  const { selectedCategory, searchQuery, setCurrentTrack, setIsPlaying, setQueue, setCurrentIndex } = useMusicStore((state) => ({
    selectedCategory: state.selectedCategory,
    searchQuery: state.searchQuery,
    setCurrentTrack: state.setCurrentTrack,
    setIsPlaying: state.setIsPlaying,
    setQueue: state.setQueue,
    setCurrentIndex: state.setCurrentIndex,
  }));

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollBarAnim = useRef(new Animated.Value(0)).current;
  const listHeight = useRef(0);
  const contentHeight = useRef(0);
  const flatListRef = useRef(null);
  const panResponder = useRef(null);
  const lastScrollOffset = useRef(0);

  // PanResponder pour la scrollbar dragable avec animation fluide
  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (contentHeight.current > listHeight.current && flatListRef.current) {
          const ratio = contentHeight.current / listHeight.current;
          const maxBarY = listHeight.current - 30;
          let barY = gestureState.y0 + gestureState.dy;
          
          barY = Math.max(0, Math.min(barY, maxBarY));
          let newOffset = barY * ratio;
          newOffset = Math.max(0, Math.min(newOffset, contentHeight.current - listHeight.current));
          
          // Mettre à jour directement sans animation pendant le drag
          scrollBarAnim.setValue(barY);
          
          flatListRef.current.scrollToOffset({
            offset: newOffset,
            animated: false,
          });
        }
      },
    });
  }, []);

  // Charger les fichiers audio au démarrage
  useEffect(() => {
    const initializeAudio = async () => {
      await audioService.initialize();
      loadAudioFiles();
    };
    
    initializeAudio();

    // Cleanup
    return () => {
      audioService.unload();
    };
  }, []);

  // Filtrer les pistes selon la recherche
  useEffect(() => {
    if (searchQuery) {
      const filtered = tracks.filter(
        (file) =>
          file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.album.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTracks(filtered);
    } else {
      setFilteredTracks(tracks);
    }
  }, [searchQuery, tracks]);

  const loadAudioFiles = async () => {
    try {
      setLoading(true);
      
      // Callback de progression pour mise à jour en temps réel
      const onProgress = (currentTracks, current, total) => {
        setTracks([...currentTracks]);
        setFilteredTracks([...currentTracks]);
        setLoadingProgress({ current, total });
      };
      
      const audioFiles = await loadAudioFilesWithMetadata(onProgress);
      
      setTracks(audioFiles);
      setFilteredTracks(audioFiles);
    } catch (error) {
      console.error('Erreur chargement fichiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPress = () => {
    // À implémenter
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handleTrackPress = async (track) => {
    try {
      // Définir la piste actuelle et la queue
      setCurrentTrack(track);
      setQueue(filteredTracks);
      setCurrentIndex(filteredTracks.findIndex(t => t.id === track.id));
      
      // Charger la piste dans le lecteur audio
      await audioService.loadTrack(track);
      
      // Démarrer la lecture
      await audioService.play();
      
      // Naviguer vers l'écran de lecture
      navigation.navigate('PlayerDetail', { track });
    } catch (error) {
      console.error('Erreur lors du démarrage de la lecture:', error);
      alert('Impossible de lire cette piste');
    }
  };

  const handleAddToPlaylist = (track) => {
    // À implémenter
  };

  const handlePlaylistPress = () => {
    navigation.navigate('Queue');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        onSearchPress={handleSearchPress}
        onSettingsPress={handleSettingsPress}
      />
      <MenuTabs />
      <FilterBar />

      {loading && filteredTracks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.loadingText}>
            Chargement des métadonnées... {loadingProgress.current}/{loadingProgress.total}
          </Text>
        </View>
      ) : filteredTracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucun fichier audio trouvé</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          {loading && (
            <View style={styles.progressBar}>
              <Text style={styles.progressText}>
                Chargement... {loadingProgress.current}/{loadingProgress.total}
              </Text>
            </View>
          )}
          <FlatList
            ref={flatListRef}
            data={filteredTracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TrackCard
                track={item}
                onPress={() => handleTrackPress(item)}
                onAddToPlaylist={() => handleAddToPlaylist(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            onScroll={(event) => {
              const currentOffset = event.nativeEvent.contentOffset.y;
              lastScrollOffset.current = currentOffset;
              scrollY.setValue(currentOffset);
              
              // Synchroniser la scrollbar position quand scroll normal
              const barPosition = (currentOffset / contentHeight.current) * listHeight.current;
              Animated.timing(scrollBarAnim, {
                toValue: barPosition,
                duration: 150,
                useNativeDriver: false,
              }).start();
            }}
            onContentSizeChange={(width, height) => {
              contentHeight.current = height;
            }}
            onLayout={(event) => {
              listHeight.current = event.nativeEvent.layout.height;
            }}
            style={styles.list}
            scrollEventThrottle={0}
          />
          
          {/* Custom Scrollbar */}
          {contentHeight.current > listHeight.current && (
            <Animated.View
              {...panResponder.current?.panHandlers}
              style={[
                styles.customScrollbar,
                {
                  height: Math.max(
                    30,
                    (listHeight.current / contentHeight.current) * listHeight.current
                  ),
                  transform: [
                    {
                      translateY: scrollBarAnim,
                    },
                  ],
                },
              ]}
            />
          )}
        </View>
      )}

      <View style={styles.footer}>
        <MiniPlayer
          onPress={() => navigation.navigate('PlayerDetail')}
          onPlaylistPress={handlePlaylistPress}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  listWrapper: {
    flex: 1,
    position: 'relative',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
  },
  customScrollbar: {
    position: 'absolute',
    right: 2,
    top: 0,
    width: 8,
    backgroundColor: '#1DB954',
    borderRadius: 4,
    opacity: 0.9,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  progressBar: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default HomeScreen;