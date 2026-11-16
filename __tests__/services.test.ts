import { getChatId } from '../src/services/chatService';
import { getFirebaseErrorMessage } from '../src/services/authService';

describe('Services Unit Tests', () => {
  describe('chatService.getChatId', () => {
    it('should generate consistent chatId regardless of order', () => {
      const id1 = getChatId('userA', 'userB');
      const id2 = getChatId('userB', 'userA');
      expect(id1).toBe('userA_userB');
      expect(id1).toBe(id2);
    });

    it('should handle sorting correctly for alphabetical UIDs', () => {
      const chatId = getChatId('zebra', 'apple');
      expect(chatId).toBe('apple_zebra');
    });
  });

  describe('authService.getFirebaseErrorMessage', () => {
    it('should return Vietnamese message for wrong password or invalid credential', () => {
      const msg = getFirebaseErrorMessage('auth/invalid-credential');
      expect(msg).toBe('Email hoặc mật khẩu không chính xác.');
    });

    it('should return Vietnamese message for email already in use', () => {
      const msg = getFirebaseErrorMessage('auth/email-already-in-use');
      expect(msg).toBe('Email này đã được sử dụng cho tài khoản khác.');
    });

    it('should return default message for unknown error', () => {
      const msg = getFirebaseErrorMessage('');
      expect(msg).toBe('Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.');
    });
  });
});
