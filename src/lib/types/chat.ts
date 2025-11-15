export interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  fullName: string;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unread?: number;
}

export interface ConversationsApiResponse {
  data: {
    conversations: Conversation[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}

export interface ChatsApiResponse {
  data: {
    chats: ChatMessage[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}
