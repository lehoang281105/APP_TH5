import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: AppButtonProps) {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  let buttonStyle: ViewStyle = styles.primaryButton;
  let textStyle: TextStyle = styles.primaryText;

  if (isOutline) {
    buttonStyle = styles.outlineButton;
    textStyle = styles.outlineText;
  } else if (isDanger) {
    buttonStyle = styles.dangerButton;
    textStyle = styles.dangerText;
  }

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        buttonStyle,
        (disabled || loading) && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline ? colors.primary : colors.white}
          size="small"
        />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
          <Text style={[styles.baseText, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  disabledButton: {
    opacity: 0.6,
  },
  baseText: {
    ...typography.bodyMedium,
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  dangerText: {
    color: colors.white,
  },
});
