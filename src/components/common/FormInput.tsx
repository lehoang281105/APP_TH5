import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface FormInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}

export default function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  style,
}: FormInputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsSecure((prev) => !prev)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isSecure ? (
              <EyeOff size={20} color={colors.textMuted} />
            ) : (
              <Eye size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.captionMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputFocused: {
    borderColor: colors.borderFocus,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: spacing.sm,
  },
  errorText: {
    ...typography.small,
    color: colors.danger,
    marginTop: spacing.xs,
  },
});
