import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMusicStore } from '../store/musicStore';

const MenuTabs = () => {
  const { selectedCategory, setSelectedCategory } = useMusicStore(
    (state) => ({
      selectedCategory: state.selectedCategory,
      setSelectedCategory: state.setSelectedCategory,
    })
  );

  const categories = [
    { id: 'favorites', label: 'Favoris', icon: 'heart' },
    { id: 'playlists', label: 'Playlists', icon: 'playlist-music' },
    { id: 'tracks', label: 'Pistes', icon: 'music' },
    { id: 'albums', label: 'Albums', icon: 'album' },
    { id: 'artists', label: 'Artistes', icon: 'account-music' },
    { id: 'genres', label: 'Genres', icon: 'tag-multiple' },
    { id: 'folders', label: 'Dossiers', icon: 'folder' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          onPress={() => setSelectedCategory(category.id)}
          style={[
            styles.tab,
            selectedCategory === category.id && styles.activeTab,
          ]}
        >
          <MaterialCommunityIcons
            name={category.icon}
            size={20}
            color={
              selectedCategory === category.id ? '#1DB954' : '#999'
            }
          />
          <Text
            style={[
              styles.label,
              selectedCategory === category.id && styles.activeLabel,
            ]}
          >
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    maxHeight: 65,
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 70,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#1DB954',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  activeLabel: {
    color: '#1DB954',
    fontWeight: '600',
  },
});

export default MenuTabs;