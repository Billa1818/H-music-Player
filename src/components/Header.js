import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Header = ({ onSearchPress, onSettingsPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <MaterialCommunityIcons name="music" size={28} color="#1DB954" />
        <Text style={styles.appName}>H Music</Text>
      </View>
      
      <View style={styles.rightSection}>
        <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
          <MaterialCommunityIcons name="magnify" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onSettingsPress} style={styles.iconButton}>
          <MaterialCommunityIcons name="cog" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  rightSection: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 8,
  },
});

export default Header;
