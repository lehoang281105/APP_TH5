import { ref, onValue, get } from 'firebase/database';
import { database } from './firebase';
import { UserProfile } from '../types';

/**
 * Lắng nghe danh sách tất cả người dùng (loại trừ tài khoản bản thân)
 * Trả về hàm hủy đăng ký để cleanup trong useEffect
 */
export const subscribeUsers = (
  currentUid: string,
  callback: (users: UserProfile[]) => void
): (() => void) => {
  const usersRef = ref(database, 'users');

  const unsubscribe = onValue(usersRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const userList: UserProfile[] = Object.keys(data)
      .filter((uid) => uid !== currentUid)
      .map((uid) => ({
        uid,
        fullName: data[uid].fullName || 'Người dùng',
        email: data[uid].email || '',
        avatar: data[uid].avatar || '',
        isOnline: !!data[uid].isOnline,
        lastSeen: data[uid].lastSeen || 0,
        createdAt: data[uid].createdAt || 0,
      }));

    // Sắp xếp: Ai đang online lên trước, sau đó xếp theo tên
    userList.sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return a.fullName.localeCompare(b.fullName);
      }
      return a.isOnline ? -1 : 1;
    });

    callback(userList);
  });

  return unsubscribe;
};

/**
 * Lắng nghe thông tin và trạng thái online/offline thời gian thực của 1 user (dùng ở Header Chat)
 */
export const subscribeUserDetail = (
  uid: string,
  callback: (user: UserProfile | null) => void
): (() => void) => {
  const userRef = ref(database, `users/${uid}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback(null);
      return;
    }
    callback({
      uid,
      fullName: data.fullName || 'Người dùng',
      email: data.email || '',
      avatar: data.avatar || '',
      isOnline: !!data.isOnline,
      lastSeen: data.lastSeen || 0,
      createdAt: data.createdAt || 0,
    });
  });

  return unsubscribe;
};

/**
 * Lấy thông tin 1 user (1 lần)
 */
export const getUserOnce = async (uid: string): Promise<UserProfile | null> => {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);
  if (!snapshot.exists()) return null;
  const data = snapshot.val();
  return {
    uid,
    fullName: data.fullName || 'Người dùng',
    email: data.email || '',
    avatar: data.avatar || '',
    isOnline: !!data.isOnline,
    lastSeen: data.lastSeen || 0,
    createdAt: data.createdAt || 0,
  };
};
