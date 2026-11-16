import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm...',
  onClear,
  style,
}: SearchBarProps) {
  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={colors.textMuted} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />
      {value.length > 0 ? (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={16} color={colors.textMuted} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 42,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    ...typography.body,
    color: colors.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
