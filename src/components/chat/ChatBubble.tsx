import React from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { ChatMessage } from '../../types';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

interface ChatBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
}

export default function ChatBubble({ message, isMyMessage }: ChatBubbleProps) {
  const formatTime = (ts: number) => {
    if (!ts) return '';
    const date = new Date(ts);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleOpenMap = () => {
    if (message.location) {
      const { latitude, longitude } = message.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  const isLocation = message.type === 'location' && message.location;

  return (
    <View
      style={[
        styles.wrapper,
        isMyMessage ? styles.myWrapper : styles.otherWrapper,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMyMessage ? styles.myBubble : styles.otherBubble,
        ]}
      >
        {isLocation ? (
          <TouchableOpacity
            style={styles.locationContainer}
            onPress={handleOpenMap}
            activeOpacity={0.8}
          >
            <View style={styles.locationHeader}>
              <MapPin
                size={18}
                color={isMyMessage ? colors.white : colors.primary}
              />
              <Text
                style={[
                  styles.locationTitle,
                  isMyMessage ? styles.myText : styles.otherLocationText,
                ]}
              >
                Vị trí được chia sẻ
              </Text>
            </View>
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myText : styles.otherText,
              ]}
            >
              {message.text}
            </Text>
            <Text
              style={[
                styles.mapHint,
                isMyMessage ? styles.myHintText : styles.otherHintText,
              ]}
            >
              (Nhấn để xem trên bản đồ)
            </Text>
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myText : styles.otherText,
            ]}
          >
            {message.text}
          </Text>
        )}

        <Text
          style={[
            styles.timeText,
            isMyMessage ? styles.myTimeText : styles.otherTimeText,
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
  },
  myWrapper: {
    justifyContent: 'flex-end',
  },
  otherWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: colors.chatSenderBg,
    borderBottomRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: colors.chatReceiverBg,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    ...typography.body,
    fontSize: 15,
  },
  myText: {
    color: colors.chatSenderText,
  },
  otherText: {
    color: colors.chatReceiverText,
  },
  timeText: {
    ...typography.small,
    fontSize: 10,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  otherTimeText: {
    color: colors.textMuted,
  },
  locationContainer: {
    paddingVertical: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationTitle: {
    ...typography.bodyMedium,
    fontWeight: '700',
    marginLeft: 4,
  },
  otherLocationText: {
    color: colors.primary,
  },
  mapHint: {
    ...typography.small,
    fontStyle: 'italic',
    marginTop: 4,
  },
  myHintText: {
    color: 'rgba(255, 255, 255, 0.85)',
  },
  otherHintText: {
    color: colors.primary,
  },
});
