import { ref, onValue, onDisconnect, serverTimestamp, update } from 'firebase/database';
import { database } from './firebase';

let unsubscribeConnected: (() => void) | null = null;

/**
 * Thiết lập cơ chế theo dõi trạng thái Online/Offline thời gian thực
 */
export const setupPresence = (uid: string) => {
  if (!uid) return;

  const connectedRef = ref(database, '.info/connected');
  const userStatusRef = ref(database, `users/${uid}`);

  const unsubscribe = onValue(connectedRef, async (snapshot) => {
    if (snapshot.val() === true) {
      // Khi mất kết nối (tắt app, mất mạng), Firebase tự động cập nhật offline
      const onDisconnectRef = onDisconnect(userStatusRef);
      await onDisconnectRef.update({
        isOnline: false,
        lastSeen: serverTimestamp(),
      });

      // Đánh dấu đang online
      await update(userStatusRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });
    }
  });

  unsubscribeConnected = unsubscribe;
};

/**
 * Hủy theo dõi trạng thái presence khi đăng xuất
 */
export const cleanupPresence = async (uid: string) => {
  if (unsubscribeConnected) {
    unsubscribeConnected();
    unsubscribeConnected = null;
  }
  if (uid) {
    try {
      const userStatusRef = ref(database, `users/${uid}`);
      await update(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    } catch {
      // Bỏ qua lỗi
    }
  }
};
