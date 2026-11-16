import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LogOut, User, Mail, ShieldCheck, Edit3, X } from 'lucide-react-native';
import { ref, update } from 'firebase/database';
import { updateProfile } from 'firebase/auth';
import ScreenContainer from '../../components/common/ScreenContainer';
import Avatar from '../../components/common/Avatar';
import AppButton from '../../components/common/AppButton';
import { logoutUser } from '../../services/authService';
import { cleanupPresence } from '../../services/presenceService';
import { getUserOnce } from '../../services/userService';
import { UserProfile } from '../../types';
import { auth, database } from '../../services/firebase';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

export default function SettingsScreen() {
  const [loggingOut, setLoggingOut] = useState(false);
  const [userFullName, setUserFullName] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  const currentUser = auth.currentUser;
  const email = currentUser?.email || 'Chưa cập nhật';
  const uid = currentUser?.uid || '';

  useEffect(() => {
    if (uid) {
      getUserOnce(uid).then((prof: UserProfile | null) => {
        if (prof?.fullName && prof.fullName !== 'Người dùng') {
          setUserFullName(prof.fullName);
        }
      });
    }
  }, [uid]);

  const displayName =
    userFullName ||
    currentUser?.displayName ||
    currentUser?.email?.split('@')[0] ||
    'Người dùng';

  const handleOpenEditModal = () => {
    setNameInput(displayName === 'Người dùng' ? '' : displayName);
    setEditModalVisible(true);
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên hợp lệ.');
      return;
    }

    try {
      setSavingName(true);

      // 1. Cập nhật vào Realtime Database /users/{uid}
      const userRef = ref(database, `users/${uid}`);
      await update(userRef, { fullName: trimmed });

      // 2. Cập nhật vào Firebase Auth Profile
      if (currentUser) {
        await updateProfile(currentUser, { displayName: trimmed });
      }

      setUserFullName(trimmed);
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Đã cập nhật tên hiển thị của bạn!');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật tên lúc này. Vui lòng thử lại.');
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoggingOut(true);
              await cleanupPresence(uid);
              await logoutUser();
            } catch {
              Alert.alert('Lỗi', 'Không thể đăng xuất lúc này. Vui lòng thử lại.');
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer scroll contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cài Đặt</Text>
      </View>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        <Avatar name={displayName} size={64} isOnline={true} showStatus={true} />
        <View style={styles.nameRow}>
          <Text style={styles.profileName}>{displayName}</Text>
          <TouchableOpacity
            style={styles.editIconBtn}
            onPress={handleOpenEditModal}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Edit3 size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>

      {/* Account Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông Tin Tài Khoản</Text>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={handleOpenEditModal}
            activeOpacity={0.7}
          >
            <View style={styles.infoIconBox}>
              <User size={18} color={colors.primary} />
            </View>
            <View style={styles.infoTextBox}>
              <Text style={styles.infoLabel}>Tên hiển thị (Bấm để đổi tên)</Text>
              <Text style={styles.infoValue}>{displayName}</Text>
            </View>
        <Edit3 size={16} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.infoRow}>
        <View style={styles.infoIconBox}>
          <Mail size={18} color={colors.primary} />
        </View>
        <View style={styles.infoTextBox}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{email}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoIconBox}>
          <ShieldCheck size={18} color={colors.primary} />
        </View>
        <View style={styles.infoTextBox}>
          <Text style={styles.infoLabel}>ID Người Dùng</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {uid}
          </Text>
        </View>
      </View>
    </View>

      {/* App Info Section */ }
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Ứng Dụng</Text>
    <View style={styles.appInfoRow}>
      <Text style={styles.appInfoLabel}>Phiên bản</Text>
      <Text style={styles.appInfoValue}>1.0.0 (TH5 Realtime Chat)</Text>
    </View>
    <View style={styles.appInfoRow}>
      <Text style={styles.appInfoLabel}>Nền tảng</Text>
      <Text style={styles.appInfoValue}>React Native CLI + Firebase RTDB</Text>
    </View>
  </View>

  {/* Logout Button */ }
  <AppButton
    title="Đăng Xuất"
    variant="danger"
    icon={<LogOut size={18} color={colors.white} />}
    onPress={handleLogout}
    loading={loggingOut}
    style={styles.logoutBtn}
  />

  {/* Edit Name Modal */ }
  <Modal
    visible={editModalVisible}
    transparent
    animationType="fade"
    onRequestClose={() => setEditModalVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Đổi Tên Hiển Thị</Text>
          <TouchableOpacity
            onPress={() => setEditModalVisible(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={styles.modalSubtitle}>
          Tên này sẽ hiển thị trong Danh bạ và các Đoạn chat của mọi người.
        </Text>

        <TextInput
          style={styles.modalInput}
          value={nameInput}
          onChangeText={setNameInput}
          placeholder="Nhập họ và tên mới..."
          placeholderTextColor={colors.textMuted}
          autoFocus
        />

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={styles.modalCancelBtn}
            onPress={() => setEditModalVisible(false)}
          >
            <Text style={styles.modalCancelText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalSaveBtn}
            onPress={handleSaveName}
            disabled={savingName}
          >
            {savingName ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.modalSaveText}>Lưu Thay Đổi</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
    </ScreenContainer >
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xxl,
  },
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
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  profileName: {
    ...typography.h3,
    color: colors.text,
  },
  editIconBtn: {
    marginLeft: spacing.sm,
    padding: 4,
  },
  profileEmail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.captionMedium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  infoValue: {
    ...typography.bodyMedium,
    color: colors.text,
    marginTop: 1,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  appInfoLabel: {
    ...typography.body,
    color: colors.text,
  },
  appInfoValue: {
    ...typography.caption,
    color: colors.textMuted,
  },
  logoutBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  modalInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    height: 48,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  modalCancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
  },
  modalSaveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 100,
  },
  modalSaveText: {
    ...typography.bodyMedium,
    color: colors.white,
    fontWeight: '600',
  },
});
