import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import Avatar from '../../components/common/Avatar';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import {
  getChatId,
  sendMessage,
  sendLocationMessage,
  subscribeMessages,
  markChatAsRead,
} from '../../services/chatService';
import { subscribeUserDetail, getUserOnce } from '../../services/userService';
import { auth } from '../../services/firebase';
import { ChatMessage, UserProfile } from '../../types';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function ChatScreen({ route, navigation }: any) {
  const { recipient }: { recipient: UserProfile } = route.params;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientLive, setRecipientLive] = useState<UserProfile>(recipient);
  const [currentFullName, setCurrentFullName] = useState<string>('');

  const flatListRef = useRef<FlatList>(null);
  const currentUid = auth.currentUser?.uid || '';
  const currentEmail = auth.currentUser?.email || '';

  const chatId = getChatId(currentUid, recipient.uid);

  // Lấy tên thật của người dùng hiện tại
  useEffect(() => {
    if (currentUid) {
      getUserOnce(currentUid).then((prof: UserProfile | null) => {
        if (prof?.fullName && prof.fullName !== 'Người dùng') {
          setCurrentFullName(prof.fullName);
        } else if (auth.currentUser?.displayName) {
          setCurrentFullName(auth.currentUser.displayName);
        } else {
          setCurrentFullName(currentEmail.split('@')[0] || 'Người dùng');
        }
      });
    }
  }, [currentUid, currentEmail]);

  // 1. Lắng nghe thông tin và trạng thái online/offline thời gian thực của người nhận
  useEffect(() => {
    const unsubUser = subscribeUserDetail(recipient.uid, (user) => {
      if (user && user.fullName && user.fullName !== 'Người dùng') {
        setRecipientLive(user);
      }
    });

    return () => {
      unsubUser();
    };
  }, [recipient.uid]);

  // 2. Lắng nghe tin nhắn realtime trong phòng chat
  useEffect(() => {
    setLoading(true);

    // Đánh dấu đã đọc tin nhắn
    markChatAsRead(currentUid, recipient.uid);

    const unsubscribe = subscribeMessages(chatId, (msgList) => {
      setMessages(msgList);
      setLoading(false);

      // Đánh dấu đã đọc mỗi khi có tin mới tới trong khi đang mở phòng chat
      markChatAsRead(currentUid, recipient.uid);
    });

    // Cleanup: Bắt buộc hủy listener để không bị duplicate tin nhắn
    return () => {
      unsubscribe();
    };
  }, [chatId, currentUid, recipient.uid]);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const handleContentSizeChange = () => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  };

  const handleSendMessage = async (text: string) => {
    const senderName =
      currentFullName ||
      auth.currentUser?.displayName ||
      currentEmail.split('@')[0] ||
      'Người dùng';
    await sendMessage(
      currentUid,
      senderName,
      recipient.uid,
      recipientLive.fullName,
      text
    );
  };

  const handleSendLocation = async (latitude: number, longitude: number) => {
    const senderName =
      currentFullName ||
      auth.currentUser?.displayName ||
      currentEmail.split('@')[0] ||
      'Người dùng';
    await sendLocationMessage(
      currentUid,
      senderName,
      recipient.uid,
      recipientLive.fullName,
      latitude,
      longitude
    );
  };

  return (
    <ScreenContainer style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <Avatar
          name={recipientLive.fullName}
          size={40}
          isOnline={recipientLive.isOnline}
          showStatus={true}
          style={styles.headerAvatar}
        />

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName} numberOfLines={1}>
            {recipientLive.fullName}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: recipientLive.isOnline
                    ? colors.online
                    : colors.offline,
                },
              ]}
            />
            <Text
              style={[
                styles.headerStatus,
                {
                  color: recipientLive.isOnline
                    ? colors.online
                    : colors.textMuted,
                },
              ]}
            >
              {recipientLive.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
            </Text>
          </View>
        </View>
      </View>

      {/* Message List */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isMyMessage={item.senderId === currentUid}
              />
            )}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={handleContentSizeChange}
            onLayout={handleContentSizeChange}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Bắt đầu cuộc trò chuyện!</Text>
                <Text style={styles.emptySubtitle}>
                  Hãy gửi lời chào đầu tiên tới {recipientLive.fullName}.
                </Text>
              </View>
            }
          />
        )}

        {/* Input Bar */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendLocation={handleSendLocation}
        />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  headerAvatar: {
    marginRight: spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerName: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  headerStatus: {
    ...typography.small,
    fontSize: 11,
  },
  chatArea: {
    flex: 1,
  },
  messageList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: 60,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
