import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MessageSquare, Users, Bell, Settings } from 'lucide-react-native';
import HomeScreen from '../screens/home/HomeScreen';
import ContactsScreen from '../screens/contacts/ContactsScreen';
import NotificationScreen from '../screens/notifications/NotificationScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { subscribeUserConversations } from '../services/chatService';
import { auth } from '../services/firebase';
import ROUTES from './routes';
import colors from '../theme/colors';

const Tab = createBottomTabNavigator();

const renderHomeIcon = ({ color, size }: { color: string; size: number }) => (
  <MessageSquare size={size} color={color} />
);

const renderContactsIcon = ({ color, size }: { color: string; size: number }) => (
  <Users size={size} color={color} />
);

const renderNotificationsIcon = ({ color, size }: { color: string; size: number }) => (
  <Bell size={size} color={color} />
);

const renderSettingsIcon = ({ color, size }: { color: string; size: number }) => (
  <Settings size={size} color={color} />
);

export default function MainTabs() {
  const [totalUnread, setTotalUnread] = useState(0);
  const currentUid = auth.currentUser?.uid || '';

  useEffect(() => {
    if (!currentUid) return;

    const unsubscribe = subscribeUserConversations(currentUid, (conversations) => {
      const unread = conversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0);
      setTotalUnread(unread);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name={ROUTES.TAB_HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Tin nhắn',
          tabBarIcon: renderHomeIcon,
          tabBarBadge: totalUnread > 0 ? totalUnread : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.badge,
            color: colors.white,
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_CONTACTS}
        component={ContactsScreen}
        options={{
          tabBarLabel: 'Danh bạ',
          tabBarIcon: renderContactsIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_NOTIFICATIONS}
        component={NotificationScreen}
        options={{
          tabBarLabel: 'Thông báo',
          tabBarIcon: renderNotificationsIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.TAB_SETTINGS}
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Cài đặt',
          tabBarIcon: renderSettingsIcon,
        }}
      />
    </Tab.Navigator>
  );
}
