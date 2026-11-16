import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { MessageSquareText } from 'lucide-react-native';
import { ref, onValue } from 'firebase/database';
import ScreenContainer from '../../components/common/ScreenContainer';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { subscribeUserConversations, markChatAsRead } from '../../services/chatService';
import { getUserOnce } from '../../services/userService';
import { auth, database } from '../../services/firebase';
import ROUTES from '../../navigation/routes';
import { UserConversation, UserProfile } from '../../types';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function HomeScreen({ navigation }: any) {
  const [conversations, setConversations] = useState<UserConversation[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  const currentUid = auth.currentUser?.uid || '';

  // 1. Lắng nghe danh sách /users để luôn lấy được tên thật và trạng thái mới nhất của đối phương
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsersMap(data);
      }
    });

    return () => {
      unsubUsers();
    };
  }, []);

  // 2. Lắng nghe danh sách hội thoại của người dùng hiện tại
  useEffect(() => {
    if (!currentUid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeUserConversations(currentUid, (convs) => {
      setConversations(convs);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);

    const isToday =
      now.getDate() === date.getDate() &&
      now.getMonth() === date.getMonth() &&
      now.getFullYear() === date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    if (isToday) {
      return `${hours}:${minutes}`;
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const handleOpenConversation = async (
    item: UserConversation,
    displayName: string
  ) => {
    // 1. Đặt số tin chưa đọc về 0 khi mở cuộc trò chuyện
    await markChatAsRead(currentUid, item.recipientId);

    // 2. Lấy thông tin đối phương từ usersMap hoặc database
    const userProfile = usersMap[item.recipientId] || (await getUserOnce(item.recipientId));
    const recipient: UserProfile = {
      uid: item.recipientId,
      fullName:
        userProfile?.fullName && userProfile.fullName !== 'Người dùng'
          ? userProfile.fullName
          : displayName,
      email: userProfile?.email || '',
      isOnline: userProfile?.isOnline ?? false,
    };

    navigation.navigate(ROUTES.CHAT_SCREEN, { recipient });
  };

  const renderConversationItem = ({ item }: { item: UserConversation }) => {
    const hasUnread = item.unreadCount > 0;

    // Lấy thông tin thật từ node /users của đối phương
    const realUser = usersMap[item.recipientId];
    const resolvedName =
      realUser?.fullName && realUser.fullName !== 'Người dùng'
        ? realUser.fullName
        : item.recipientName && item.recipientName !== 'Người dùng'
        ? item.recipientName
        : realUser?.email
        ? realUser.email.split('@')[0]
        : 'Người dùng';

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => handleOpenConversation(item, resolvedName)}
        activeOpacity={0.7}
      >
        <Avatar
          name={resolvedName}
          size={50}
          isOnline={realUser?.isOnline}
          showStatus={true}
        />

        <View style={styles.chatDetails}>
          <View style={styles.topRow}>
            <Text
              style={[styles.recipientName, hasUnread && styles.unreadText]}
              numberOfLines={1}
            >
              {resolvedName}
            </Text>
            <Text style={[styles.timeText, hasUnread && styles.unreadTime]}>
              {formatMessageTime(item.lastMessageTime)}
            </Text>
          </View>

          <View style={styles.bottomRow}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadLastMessage]}
              numberOfLines={1}
            >
              {item.lastMessage || 'Bắt đầu cuộc trò chuyện'}
            </Text>

            {hasUnread ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đoạn Chat</Text>
      </View>

      {/* Conversation List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải cuộc trò chuyện...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.chatId || item.recipientId}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<MessageSquareText size={52} color={colors.textMuted} />}
              title="Chưa có cuộc trò chuyện nào"
              description="Hãy chuyển sang tab Danh bạ để tìm bạn bè và bắt đầu nhắn tin ngay!"
              actionLabel="Đi đến Danh bạ"
              onAction={() => navigation.navigate(ROUTES.TAB_CONTACTS)}
            />
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  listContent: {
    padding: spacing.md,
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
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 14,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chatDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipientName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  timeText: {
    ...typography.small,
    color: colors.textMuted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadText: {
    fontWeight: '700',
    color: colors.black,
  },
  unreadTime: {
    color: colors.primary,
    fontWeight: '600',
  },
  unreadLastMessage: {
    color: colors.text,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: colors.badge,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    ...typography.small,
    fontSize: 10,
    color: colors.white,
    fontWeight: '700',
  },
});
