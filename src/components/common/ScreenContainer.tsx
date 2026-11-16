import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../theme/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export default function ScreenContainer({
  children,
  scroll = false,
  style,
  contentContainerStyle,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.container, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
