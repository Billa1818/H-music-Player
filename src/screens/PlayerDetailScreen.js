import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useMusicStore } from '../store/musicStore';
import { audioService } from '../services/audioService';

const PlayerDetailScreen = ({ navigation, route }) => {
  const { currentTrack, isPlaying, duration, position, volume, setVolume, setIsPlaying, playNext, playPrevious } =
    useMusicStore((state) => ({
      currentTrack: state.currentTrack,
      isPlaying: state.isPlaying,
      duration: state.duration,
      position: state.position,
      volume: state.volume,
      setVolume: state.setVolume,
      setIsPlaying: state.setIsPlaying,
      playNext: state.playNext,
      playPrevious: state.playPrevious,
    }));

  const track = route?.params?.track || currentTrack;
  const [animatedRotation] = useState(new Animated.Value(0));
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(animatedRotation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isPlaying]);

  const rotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor(ms / 1000 / 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!track) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-down" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.noTrackText}>Aucune musique sélectionnée</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-down" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lecture en cours</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Album art */}
      <View style={styles.albumContainer}>
        <Animated.View
          style={[
            styles.albumArt,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          {track.thumbnail ? (
            <Image source={{ uri: track.thumbnail }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <MaterialCommunityIcons name="music" size={80} color="#fff" />
            </View>
          )}
        </Animated.View>
      </View>

      {/* Contrôles et informations */}
      <View style={styles.bottomContainer}>
        {/* Informations de la musique */}
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{track.title}</Text>
            <TouchableOpacity style={styles.favoriteButton}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={24}
                color="#e74c3c"
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.artist}>{track.artist}</Text>
          {track.album && <Text style={styles.album}>{track.album}</Text>}
        </View>

        {/* Slider de progression */}
        <View style={styles.progressContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration || 0}
            value={position}
            onSlidingStart={() => setIsSeeking(true)}
            onValueChange={(val) => {
              // Mise à jour visuelle pendant le glissement
            }}
            onSlidingComplete={async (val) => {
              // Changer la position quand le glissement est terminé
              await audioService.setPosition(val);
              setIsSeeking(false);
            }}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#e5e5e5"
            thumbTintColor="#1DB954"
          />
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>
        </View>

        {/* Contrôles principaux */}
        <View style={styles.controlsContainer}>
        <TouchableOpacity>
          <MaterialCommunityIcons name="shuffle" size={28} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.prevButton} onPress={() => {
          playPrevious();
        }}>
          <MaterialCommunityIcons
            name="skip-previous-circle"
            size={56}
            color="#1DB954"
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton}
          onPress={async () => {
            if (isPlaying) {
              await audioService.pause();
            } else {
              await audioService.play();
            }
            setIsPlaying(!isPlaying);
          }}
        >
          <MaterialCommunityIcons
            name={isPlaying ? 'pause-circle' : 'play-circle'}
            size={64}
            color="#1DB954"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={() => {
          playNext();
        }}>
          <MaterialCommunityIcons
            name="skip-next-circle"
            size={56}
            color="#1DB954"
          />
        </TouchableOpacity>

        <TouchableOpacity>
          <MaterialCommunityIcons name="repeat" size={28} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Contrôle du volume */}
      <View style={styles.volumeContainer}>
        <MaterialCommunityIcons name="volume-low" size={20} color="#999" />
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={volume}
          onValueChange={async (val) => {
            setVolume(val);
            await audioService.setVolume(val);
          }}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#e5e5e5"
          thumbTintColor="#1DB954"
        />
        <MaterialCommunityIcons name="volume-high" size={20} color="#999" />
      </View>

      {/* Actions secondaires */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="share-variant" size={22} color="#333" />
          <Text style={styles.actionText}>Partager</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons
            name="playlist-music"
            size={22}
            color="#333"
          />
          <Text style={styles.actionText}>Queue</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialCommunityIcons name="information" size={22} color="#333" />
          <Text style={styles.actionText}>Infos</Text>
        </TouchableOpacity>
      </View>
      </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    flexDirection: 'column',
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  albumContainer: {
    alignItems: 'center',
    marginVertical: 0,
    paddingVertical: 20,
    flex: 1,
    justifyContent: 'center',
  },
  albumArt: {
    alignItems: 'center',
  },
  image: {
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  placeholderImage: {
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginVertical: 12,
    paddingHorizontal: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  artist: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  album: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  favoriteButton: {
    paddingLeft: 12,
  },
  progressContainer: {
    marginVertical: 8,
  },
  slider: {
    height: 40,
    borderRadius: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  playButton: {
    marginHorizontal: 8,
  },
  prevButton: {
    marginRight: 12,
  },
  nextButton: {
    marginLeft: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  noTrackText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
});

export default PlayerDetailScreen;
