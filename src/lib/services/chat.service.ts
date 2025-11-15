import { ConversationsApiResponse, ChatsApiResponse } from '../types/chat';
import axiosInstance from '../axios';

export const chatService = {
  /**
   * Lấy danh sách conversations (Many Conversations API)
   * @param params - page và limit
   * @returns Danh sách conversations
   */
  getManyConversations: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ConversationsApiResponse['data']> => {
    // Axios interceptor returns response.data directly
    const response = await axiosInstance.get<ConversationsApiResponse>(
      '/chat/conversations',
      { params }
    );
    return response as any; // Interceptor already unwrapped
  },

  /**
   * Lấy lịch sử chat với một user cụ thể (Many Chats API)
   * @param params - toUserId, page, limit
   * @returns Danh sách messages
   */
  getManyChats: async (params: {
    toUserId: string;
    page?: number;
    limit?: number;
  }): Promise<ChatsApiResponse['data']> => {
    // Axios interceptor returns response.data directly
    const response = await axiosInstance.get<ChatsApiResponse>(
      '/chat',
      { params }
    );
    return response as any; // Interceptor already unwrapped
  },

  /**
   * Gửi tin nhắn mới (POST /chat API)
   * @param data - fromUserId, toUserId, content
   * @returns Tin nhắn đã được tạo
   */
  sendChat: async (data: {
    fromUserId: string;
    toUserId: string;
    content: string;
  }): Promise<any> => {
    const response = await axiosInstance.post('/chat', data);
    return response as any; // Interceptor already unwrapped
  },
};
