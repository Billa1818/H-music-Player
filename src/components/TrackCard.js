import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMusicStore } from '../store/musicStore';

const TrackCard = ({ track, onPress, onAddToPlaylist }) => {
  const { favorites, addToFavorites, removeFromFavorites } = useMusicStore(
    (state) => ({
      favorites: state.favorites,
      addToFavorites: state.addToFavorites,
      removeFromFavorites: state.removeFromFavorites,
    })
  );

  const isFavorite = favorites.some((t) => t.id === track.id);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(track.id);
    } else {
      addToFavorites(track);
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {track.thumbnail ? (
        <Image 
          source={{ uri: track.thumbnail }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
          <MaterialCommunityIcons name="music" size={24} color="#fff" />
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
        </Text>
        <Text style={styles.album} numberOfLines={1}>
          {track.album}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleToggleFavorite}
          style={styles.actionButton}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? '#e74c3c' : '#999'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAddToPlaylist}
          style={styles.actionButton}
        >
          <MaterialCommunityIcons name="plus-circle" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 6,
    overflow: 'hidden',
    paddingRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  placeholderThumbnail: {
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 8,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
    lineHeight: 18, // Ajouté pour contrôler l'espacement
  },
  artist: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontWeight: '500',
    lineHeight: 14, // Ajouté pour contrôler l'espacement
  },
  album: {
    fontSize: 11,
    color: '#999',
    lineHeight: 13, // Ajouté pour contrôler l'espacement
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
});

export default TrackCard;