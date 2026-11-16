import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import { Send, MapPin } from 'lucide-react-native';
import Geolocation from '@react-native-community/geolocation';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  onSendLocation: (latitude: number, longitude: number) => Promise<void>;
}

export default function ChatInput({
  onSendMessage,
  onSendLocation,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      setText('');
      await onSendMessage(trimmed);
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
    } finally {
      setSending(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message: 'Ứng dụng cần quyền vị trí để chia sẻ tọa độ hiện tại trong tin nhắn.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
    return true;
  };

  const handleShareLocation = async () => {
    if (gettingLocation) return;

    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập vị trí để sử dụng tính năng này.');
      return;
    }

    setGettingLocation(true);
    Geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await onSendLocation(latitude, longitude);
        } catch {
          Alert.alert('Lỗi', 'Không thể chia sẻ vị trí. Vui lòng thử lại.');
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        Alert.alert('Lỗi vị trí', error.message || 'Không thể lấy vị trí hiện tại.');
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
    );
  };

  const canSend = text.trim().length > 0 && !sending;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleShareLocation}
        disabled={gettingLocation}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {gettingLocation ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <MapPin size={22} color={colors.primary} />
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={1000}
      />

      <TouchableOpacity
        style={[styles.sendButton, canSend && styles.sendButtonActive]}
        onPress={handleSend}
        disabled={!canSend}
        activeOpacity={0.8}
      >
        {sending ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Send
            size={18}
            color={canSend ? colors.white : colors.textMuted}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  iconButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginHorizontal: spacing.xs,
    maxHeight: 100,
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
  },
});
