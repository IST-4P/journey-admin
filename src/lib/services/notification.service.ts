import {
  BroadcastNotificationRequest,
  BroadcastNotificationResponse,
  CreateNotificationRequest,
  GetManyNotificationsRequest,
  GetManyNotificationsResponse,
  GetNotificationResponse,
} from '@domain/notification';
import axiosInstance from '../axios';

export const notificationService = {
  /**
   * Lấy danh sách notifications với phân trang
   * @param params - userId và pagination params
   * @returns Danh sách notifications
   */
  getManyNotifications: async (
    params?: GetManyNotificationsRequest
  ): Promise<GetManyNotificationsResponse> => {
    const response = await axiosInstance.get<
      unknown,
      GetManyNotificationsResponse
    >('/notification/list', { params });
    return response;
  },

  /**
   * Tạo notification cho một user cụ thể
   * @param data - userId, type, title, content
   * @returns Notification đã tạo
   */
  createNotification: async (
    data: CreateNotificationRequest
  ): Promise<GetNotificationResponse> => {
    const response = await axiosInstance.post<
      unknown,
      GetNotificationResponse
    >('/notification', data);
    return response;
  },

  /**
   * Gửi broadcast notification đến tất cả users
   * @param data - Dữ liệu thông báo (title, content, type)
   * @returns Response chứa totalCreated
   */
  broadcastNotification: async (
    data: BroadcastNotificationRequest
  ): Promise<BroadcastNotificationResponse> => {
    const response = await axiosInstance.post<
      unknown,
      BroadcastNotificationResponse
    >('/notification/broadcast', data);
    return response;
  },
};
