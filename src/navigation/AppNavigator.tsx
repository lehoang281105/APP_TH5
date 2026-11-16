import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { User } from 'firebase/auth';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import ChatScreen from '../screens/chat/ChatScreen';
import { subscribeAuth, ensureUserProfile } from '../services/authService';
import { setupPresence } from '../services/presenceService';
import ROUTES from './routes';
import colors from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        setupPresence(user.uid);
        await ensureUserProfile(user);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {currentUser ? (
          <>
            <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabs} />
            <Stack.Screen
              name={ROUTES.CHAT_SCREEN}
              component={ChatScreen}
              options={{ animation: 'slide_from_right' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
