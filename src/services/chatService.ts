import {
  ref,
  push,
  set,
  onValue,
  serverTimestamp,
  update,
  get,
} from 'firebase/database';
import { database } from './firebase';
import { ChatMessage, UserConversation } from '../types';

/**
 * Sinh ID cuộc trò chuyện 1-1 duy nhất giữa 2 người
 */
export const getChatId = (uid1: string, uid2: string): string => {
  return [uid1, uid2].sort().join('_');
};

/**
 * Gửi tin nhắn văn bản
 */
export const sendMessage = async (
  senderId: string,
  senderName: string,
  receiverId: string,
  receiverName: string,
  text: string
): Promise<void> => {
  if (!text.trim()) return;

  const chatId = getChatId(senderId, receiverId);
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);

  const messageData = {
    id: newMessageRef.key,
    senderId,
    senderName,
    receiverId,
    text: text.trim(),
    type: 'text',
    timestamp: Date.now(),
  };

  // 1. Lưu tin nhắn vào phòng chat
  await set(newMessageRef, {
    ...messageData,
    timestamp: serverTimestamp(),
  });

  // 2. Cập nhật bảng hội thoại cho người gửi (unreadCount = 0)
  const senderConvRef = ref(database, `userChats/${senderId}/${receiverId}`);
  await update(senderConvRef, {
    chatId,
    recipientId: receiverId,
    recipientName: receiverName,
    lastMessage: text.trim(),
    lastMessageTime: Date.now(),
    unreadCount: 0,
  });

  // 3. Cập nhật bảng hội thoại cho người nhận (tăng unreadCount)
  const receiverConvRef = ref(database, `userChats/${receiverId}/${senderId}`);
  const receiverConvSnap = await get(receiverConvRef);
  let currentUnread = 0;
  if (receiverConvSnap.exists()) {
    currentUnread = receiverConvSnap.val().unreadCount || 0;
  }

  await update(receiverConvRef, {
    chatId,
    recipientId: senderId,
    recipientName: senderName,
    lastMessage: text.trim(),
    lastMessageTime: Date.now(),
    unreadCount: currentUnread + 1,
  });
};

/**
 * Gửi tin nhắn chia sẻ vị trí hiện tại
 */
export const sendLocationMessage = async (
  senderId: string,
  senderName: string,
  receiverId: string,
  receiverName: string,
  latitude: number,
  longitude: number
): Promise<void> => {
  const chatId = getChatId(senderId, receiverId);
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const newMessageRef = push(messagesRef);

  const locationText = `📍 Vị trí: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

  const messageData = {
    id: newMessageRef.key,
    senderId,
    senderName,
    receiverId,
    text: locationText,
    type: 'location',
    location: {
      latitude,
      longitude,
    },
    timestamp: Date.now(),
  };

  // 1. Lưu tin nhắn vị trí
  await set(newMessageRef, {
    ...messageData,
    timestamp: serverTimestamp(),
  });

  // 2. Cập nhật userChats người gửi
  const senderConvRef = ref(database, `userChats/${senderId}/${receiverId}`);
  await update(senderConvRef, {
    chatId,
    recipientId: receiverId,
    recipientName: receiverName,
    lastMessage: locationText,
    lastMessageTime: Date.now(),
    unreadCount: 0,
  });

  // 3. Cập nhật userChats người nhận
  const receiverConvRef = ref(database, `userChats/${receiverId}/${senderId}`);
  const receiverConvSnap = await get(receiverConvRef);
  let currentUnread = 0;
  if (receiverConvSnap.exists()) {
    currentUnread = receiverConvSnap.val().unreadCount || 0;
  }

  await update(receiverConvRef, {
    chatId,
    recipientId: senderId,
    recipientName: senderName,
    lastMessage: locationText,
    lastMessageTime: Date.now(),
    unreadCount: currentUnread + 1,
  });
};

/**
 * Lắng nghe tin nhắn trong phòng chat 1-1 thời gian thực
 * Trả về hàm hủy để cleanup trong useEffect (tránh duplicated tin nhắn)
 */
export const subscribeMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): (() => void) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);

  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const messageList: ChatMessage[] = Object.keys(data).map((key) => {
      const item = data[key];
      return {
        id: key,
        senderId: item.senderId || '',
        senderName: item.senderName || '',
        receiverId: item.receiverId || '',
        text: item.text || '',
        type: item.type || 'text',
        location: item.location,
        timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
      };
    });

    // Sắp xếp theo thứ tự thời gian tăng dần để tin mới nhất ở cuối danh sách
    messageList.sort((a, b) => a.timestamp - b.timestamp);
    callback(messageList);
  });

  return unsubscribe;
};

/**
 * Lắng nghe danh sách hội thoại của người dùng (Màn hình Home)
 * Trả về hàm hủy để cleanup trong useEffect
 */
export const subscribeUserConversations = (
  currentUid: string,
  callback: (conversations: UserConversation[]) => void
): (() => void) => {
  const userChatsRef = ref(database, `userChats/${currentUid}`);

  const unsubscribe = onValue(userChatsRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }

    const convList: UserConversation[] = Object.keys(data).map((key) => {
      const item = data[key];
      return {
        chatId: item.chatId || '',
        recipientId: key,
        recipientName: item.recipientName || 'Người dùng',
        recipientAvatar: item.recipientAvatar || '',
        lastMessage: item.lastMessage || '',
        lastMessageTime: item.lastMessageTime || 0,
        unreadCount: item.unreadCount || 0,
      };
    });

    // Sắp xếp hội thoại có tin nhắn mới nhất lên đầu
    convList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    callback(convList);
  });

  return unsubscribe;
};

/**
 * Đặt số tin chưa đọc về 0 khi mở cuộc trò chuyện
 */
export const markChatAsRead = async (
  currentUid: string,
  recipientId: string
): Promise<void> => {
  try {
    const convRef = ref(database, `userChats/${currentUid}/${recipientId}`);
    await update(convRef, {
      unreadCount: 0,
    });
  } catch {
    // Bỏ qua lỗi
  }
};
