import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);

  const settingsSections = [
    {
      title: 'Lecture',
      items: [
        {
          icon: 'repeat',
          label: 'Mode de répétition',
          value: 'Tous',
          onPress: () => {},
        },
        {
          icon: 'shuffle',
          label: 'Lecture aléatoire',
          isSwitch: true,
          value: false,
        },
      ],
    },
    {
      title: 'Affichage',
      items: [
        {
          icon: 'palette',
          label: 'Mode sombre',
          isSwitch: true,
          value: darkMode,
          onPress: (val) => setDarkMode(val),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'bell',
          label: 'Notifications',
          isSwitch: true,
          value: notifications,
          onPress: (val) => setNotifications(val),
        },
      ],
    },
    {
      title: 'À propos',
      items: [
        {
          icon: 'information',
          label: 'Version',
          value: '1.0.0',
          onPress: () => {},
        },
        {
          icon: 'file-document',
          label: 'Conditions d\'utilisation',
          onPress: () => {},
        },
        {
          icon: 'shield-account',
          label: 'Politique de confidentialité',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.onPress}
              >
                <View style={styles.itemLeft}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color="#1DB954"
                  />
                  <Text style={styles.itemLabel}>{item.label}</Text>
                </View>
                {item.isSwitch ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onPress}
                    trackColor={{ false: '#ccc', true: '#1DB954' }}
                    thumbColor="#fff"
                  />
                ) : (
                  <View style={styles.itemRight}>
                    <Text style={styles.itemValue}>{item.value}</Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="#999"
                    />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1DB954',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 13,
    color: '#999',
  },
});

export default SettingsScreen;
