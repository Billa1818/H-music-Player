import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMusicStore } from '../store/musicStore';
import { audioService } from '../services/audioService';

const MiniPlayer = ({ onPress, onPlaylistPress }) => {
  const { currentTrack, isPlaying, playPrevious, playNext, setIsPlaying } = useMusicStore(
    (state) => ({
      currentTrack: state.currentTrack,
      isPlaying: state.isPlaying,
      playPrevious: state.playPrevious,
      playNext: state.playNext,
      setIsPlaying: state.setIsPlaying,
    })
  );

  const handlePlayPause = async () => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      await audioService.pause();
      setIsPlaying(false);
    } else {
      await audioService.play();
      setIsPlaying(true);
    }
  };

  const handleSkipPrevious = () => {
    if (!currentTrack) return;
    playPrevious();
  };

  const handleSkipNext = () => {
    if (!currentTrack) return;
    playNext();
  };

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.trackInfo}>
        {currentTrack?.thumbnail ? (
          <Image
            source={{ uri: currentTrack.thumbnail }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <MaterialCommunityIcons name="music" size={20} color="#fff" />
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack?.title || 'Pas de musique'}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack?.artist || 'Sélectionnez une piste'}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          onPress={handleSkipPrevious} 
          style={[styles.controlButton, !currentTrack && styles.disabledButton]}
          disabled={!currentTrack}
        >
          <MaterialCommunityIcons 
            name="skip-previous" 
            size={22} 
            color={currentTrack ? '#1DB954' : '#ccc'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handlePlayPause} 
          style={[styles.playButton, !currentTrack && styles.disabledPlayButton]}
          disabled={!currentTrack}
        >
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleSkipNext} 
          style={[styles.controlButton, !currentTrack && styles.disabledButton]}
          disabled={!currentTrack}
        >
          <MaterialCommunityIcons 
            name="skip-next" 
            size={22} 
            color={currentTrack ? '#1DB954' : '#ccc'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onPlaylistPress} 
          style={[styles.controlButton, !currentTrack && styles.disabledButton]}
          disabled={!currentTrack}
        >
          <MaterialCommunityIcons 
            name="playlist-music" 
            size={20} 
            color={currentTrack ? '#333' : '#ccc'} 
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  thumbnail: {
    width: 45,
    height: 45,
    borderRadius: 4,
  },
  placeholderThumbnail: {
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  artist: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#1DB954',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.4,
  },
  disabledPlayButton: {
    backgroundColor: '#999',
    opacity: 0.4,
  },
});

export default MiniPlayer;
