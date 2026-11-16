import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { ref, set, serverTimestamp, get, update } from 'firebase/database';
import { auth, database } from './firebase';
import { UserProfile } from '../types';

export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'Firebase API Key không hợp lệ. Vui lòng dán cấu hình Firebase của bạn vào file src/config/firebaseConfig.ts.';
    case 'auth/operation-not-allowed':
      return 'Chưa bật Email/Password trên Firebase Console. Vui lòng vào Authentication > Sign-in method và BẬT Email/Password.';
    case 'auth/invalid-email':
      return 'Địa chỉ email không đúng định dạng.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị khóa.';
    case 'auth/user-not-found':
      return 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Email hoặc mật khẩu không chính xác.';
    case 'auth/email-already-in-use':
      return 'Email này đã được sử dụng cho tài khoản khác.';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu (yêu cầu tối thiểu 6 ký tự).';
    case 'auth/network-request-failed':
      return 'Không có kết nối mạng tới Firebase. Vui lòng kiểm tra kết nối Internet.';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần thử thất bại. Vui lòng thử lại sau ít phút.';
    default:
      if (errorCode) {
        return `Lỗi xác thực (${errorCode}). Vui lòng kiểm tra cấu hình Firebase trong src/config/firebaseConfig.ts.`;
      }
      return 'Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.';
  }
};

/**
 * Đăng ký tài khoản mới và lưu thông tin hồ sơ vào Realtime Database
 */
export const registerUser = async (
  fullName: string,
  email: string,
  pass: string
): Promise<UserProfile> => {
  const trimmedName = fullName.trim();
  const trimmedEmail = email.trim();

  const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, pass);
  const user = userCredential.user;

  // Cập nhật displayName vào Firebase Auth profile
  try {
    await updateProfile(user, { displayName: trimmedName });
  } catch {
    // Bỏ qua nếu lỗi cập nhật profile Auth
  }

  const userProfile: UserProfile = {
    uid: user.uid,
    fullName: trimmedName,
    email: user.email || trimmedEmail,
    avatar: '',
    isOnline: true,
    lastSeen: Date.now(),
    createdAt: Date.now(),
  };

  // Lưu thông tin người dùng vào Firebase Realtime Database: /users/{uid}
  const userRef = ref(database, `users/${user.uid}`);
  await set(userRef, {
    ...userProfile,
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
  });

  return userProfile;
};

/**
 * Đảm bảo thông tin user luôn tồn tại đầy đủ trong node /users/{uid}
 */
export const ensureUserProfile = async (user: User): Promise<void> => {
  if (!user || !user.uid) return;
  try {
    const userRef = ref(database, `users/${user.uid}`);
    const snap = await get(userRef);

    let fullName = user.displayName || '';
    if (snap.exists()) {
      const data = snap.val();
      if (data.fullName && data.fullName !== 'Người dùng') {
        fullName = data.fullName;
      }
    }

    if (!fullName) {
      fullName = user.email ? user.email.split('@')[0] : 'Người dùng';
    }

    await update(userRef, {
      uid: user.uid,
      fullName,
      email: user.email || '',
      isOnline: true,
      lastSeen: serverTimestamp(),
    });
  } catch {
    // Bỏ qua lỗi kết nối
  }
};

/**
 * Đăng nhập bằng Email và Password
 */
export const loginUser = async (email: string, pass: string): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const user = userCredential.user;
  await ensureUserProfile(user);
  return user;
};

/**
 * Đăng xuất tài khoản
 */
export const logoutUser = async (): Promise<void> => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const userStatusRef = ref(database, `users/${currentUser.uid}`);
      await update(userStatusRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
      });
    } catch {
      // Bỏ qua lỗi nếu mất mạng
    }
  }
  await signOut(auth);
};

/**
 * Lắng nghe trạng thái đăng nhập
 */
export const subscribeAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
