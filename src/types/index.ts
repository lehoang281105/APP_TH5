export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: number;
  createdAt?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  type?: 'text' | 'location';
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: number;
}

export interface UserConversation {
  chatId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
}
