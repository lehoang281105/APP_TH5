import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Bell, Info, CheckCircle2 } from 'lucide-react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import EmptyState from '../../components/common/EmptyState';
import { AppNotification } from '../../types';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Chào mừng bạn đến với ứng dụng Chat Realtime!',
    body: 'Tài khoản của bạn đã được khởi tạo thành công trên hệ thống Firebase. Bắt đầu tìm bạn bè trong danh bạ nhé!',
    time: 'Vừa xong',
    isRead: false,
  },
  {
    id: '2',
    title: 'Tính năng chia sẻ vị trí mới',
    body: 'Bạn có thể chia sẻ vị trí toạ độ GPS của mình cho bạn bè ngay trong khung chat 1-1 bằng biểu tượng ghim định vị.',
    time: 'Hôm nay',
    isRead: false,
  },
  {
    id: '3',
    title: 'Bảo mật tài khoản',
    body: 'Ứng dụng đã thiết lập luật bảo mật Realtime Database. Tin nhắn của bạn được bảo mật tuyệt đối.',
    time: 'Hôm qua',
    isRead: true,
  },
];

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true }))
    );
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isRead: !item.isRead } : item
      )
    );
  };

  const renderNotificationItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={[styles.card, !item.isRead && styles.unreadCard]}
      onPress={() => handleToggleRead(item.id)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: item.isRead ? colors.background : colors.primaryLight },
        ]}
      >
        <Info
          size={22}
          color={item.isRead ? colors.textMuted : colors.primary}
        />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text
            style={[styles.cardTitle, !item.isRead && styles.unreadTitle]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <Text style={styles.cardBody} numberOfLines={3}>
          {item.body}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {notifications.some((n) => !n.isRead) ? (
          <TouchableOpacity
            style={styles.markReadBtn}
            onPress={handleMarkAllRead}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CheckCircle2 size={16} color={colors.primary} />
            <Text style={styles.markReadText}>Đánh dấu đã đọc</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<Bell size={48} color={colors.textMuted} />}
            title="Không có thông báo nào"
            description="Tất cả các thông báo mới từ hệ thống sẽ xuất hiện tại đây."
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markReadText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unreadCard: {
    borderColor: colors.primaryLight,
    backgroundColor: '#F0F7FF',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadTitle: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  cardTime: {
    ...typography.small,
    color: colors.textMuted,
  },
  cardBody: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
