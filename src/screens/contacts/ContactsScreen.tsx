import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Users } from 'lucide-react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import SearchBar from '../../components/common/SearchBar';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { subscribeUsers } from '../../services/userService';
import { auth } from '../../services/firebase';
import ROUTES from '../../navigation/routes';
import { UserProfile } from '../../types';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function ContactsScreen({ navigation }: any) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUid = auth.currentUser?.uid || '';

  useEffect(() => {
    if (!currentUid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Bắt đầu lắng nghe danh sách người dùng realtime
    const unsubscribe = subscribeUsers(currentUid, (userList) => {
      setUsers(userList);
      setLoading(false);
    });

    // Cleanup trong useEffect để hủy listener khi unmount
    return () => {
      unsubscribe();
    };
  }, [currentUid]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleOpenChat = (recipient: UserProfile) => {
    navigation.navigate(ROUTES.CHAT_SCREEN, { recipient });
  };

  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleOpenChat(item)}
      activeOpacity={0.7}
    >
      <Avatar
        name={item.fullName}
        size={48}
        isOnline={item.isOnline}
        showStatus={true}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName} numberOfLines={1}>
          {item.fullName}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1}>
          {item.email}
        </Text>
      </View>
      <View style={styles.statusBadge}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: item.isOnline ? colors.online : colors.offline },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            { color: item.isOnline ? colors.online : colors.textMuted },
          ]}
        >
          {item.isOnline ? 'Online' : 'Offline'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Danh Bạ</Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tìm theo tên hoặc email..."
          style={styles.searchBar}
        />
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh bạ...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.uid}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Users size={48} color={colors.textMuted} />}
              title={searchQuery ? 'Không tìm thấy người dùng' : 'Chưa có người dùng nào'}
              description={
                searchQuery
                  ? `Không có kết quả nào phù hợp với "${searchQuery}".`
                  : 'Danh bạ sẽ hiển thị những người dùng khác khi họ đăng ký tài khoản.'
              }
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
  screenTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  searchBar: {
    marginBottom: spacing.xs,
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  userName: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  statusIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    ...typography.small,
    fontWeight: '600',
  },
});
