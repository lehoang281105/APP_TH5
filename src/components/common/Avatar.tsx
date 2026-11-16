import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import colors from '../../theme/colors';

interface AvatarProps {
  name: string;
  size?: number;
  isOnline?: boolean;
  showStatus?: boolean;
  style?: ViewStyle;
}

export default function Avatar({
  name,
  size = 44,
  isOnline = false,
  showStatus = false,
  style,
}: AvatarProps) {
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (str: string) => {
    const palette = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#8B5CF6', // Purple
      '#F59E0B', // Amber
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#6366F1', // Indigo
    ];
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    const index = sum % palette.length;
    return palette[index];
  };

  const statusDotSize = Math.max(10, Math.floor(size / 3.8));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getBackgroundColor(name || 'User'),
          },
        ]}
      >
        <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
          {getInitials(name)}
        </Text>
      </View>
      {showStatus ? (
        <View
          style={[
            styles.statusDot,
            {
              width: statusDotSize,
              height: statusDotSize,
              borderRadius: statusDotSize / 2,
              backgroundColor: isOnline ? colors.online : colors.offline,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: colors.white,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: colors.surface,
    right: 0,
    bottom: 0,
  },
});
