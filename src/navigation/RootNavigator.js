import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  HomeScreen,
  PlayerDetailScreen,
  SettingsScreen,
  QueueScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="PlayerDetail"
          component={PlayerDetailScreen}
          options={{
            animationEnabled: true,
            cardStyle: { backgroundColor: '#fff' },
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            animationEnabled: true,
            cardStyle: { backgroundColor: '#f5f5f5' },
          }}
        />
        <Stack.Screen
          name="Queue"
          component={QueueScreen}
          options={{
            animationEnabled: true,
            cardStyle: { backgroundColor: '#f5f5f5' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
