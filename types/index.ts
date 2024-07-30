export interface User {
  id: number;
  username: string;
  email: string;
  profileImage?: string;
  bio: string;
  presenceStatus: "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";
}

export interface Conversation {
  id: number;
  name?: string;
  isGroup: boolean;
  lastMessage?: Message;
  participants: Participant[];
  inviteCode?: string;
  groupProfile?: string;
}

export interface Participant {
  id: number;
  userId: number;
  conversationId: number;
  joinedAt: string;
  leftAt?: string;
  isAdmin: boolean;
  user: User;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  contentType: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "VIDEO";
  timestamp: string;
  updatedAt: string;
  sender: User;
  reactions: MessageReaction[];
  parentId?: number;
  parent?: Message;
  readBy: ReadReceipt[];
}

export interface ReadReceipt {
  id: number;
  messageId: number;
  userId: number;
  readAt: string;
  message: Message;
  user: User;
}

export interface MessageReaction {
  id: number;
  messageId: number;
  userId: number;
  reaction: string;
  user: User;
}
