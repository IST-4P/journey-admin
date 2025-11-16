import { ComplaintsApiResponse, ComplaintMessagesApiResponse } from '../types/complaint';
import axiosInstance from '../axios';

export const complaintService = {
  /**
   * Lấy danh sách complaints (Many Complaints API)
   * Endpoint: GET /complaint?limit=10&page=1&status=OPEN
   * @param params - page, limit, status
   * @returns Danh sách complaints
   */
  getManyComplaints: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ComplaintsApiResponse['data']> => {
    const response = await axiosInstance.get<ComplaintsApiResponse>(
      '/complaint',
      { params }
    );
    return response as any; // Interceptor already unwrapped
  },

  /**
   * Cập nhật status của complaint
   * Endpoint: PUT /complaint
   * @param data - id và status mới
   * @returns Complaint đã cập nhật
   */
  updateComplaintStatus: async (data: {
    id: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  }): Promise<any> => {
    const response = await axiosInstance.put('/complaint', data);
    return response as any; // Interceptor already unwrapped
  },

  /**
   * Lấy lịch sử complaint messages (Many Complaint Messages API)
   * Endpoint: GET /complaint-message?complaintId=xxx&page=1&limit=10
   * @param params - complaintId, page, limit
   * @returns Danh sách complaint messages
   */
  getManyComplaintMessages: async (params: {
    complaintId: string;
    page?: number;
    limit?: number;
  }): Promise<ComplaintMessagesApiResponse['data']> => {
    const response = await axiosInstance.get<ComplaintMessagesApiResponse>(
      '/complaint-message',
      { params }
    );
    return response as any; // Interceptor already unwrapped
  },
};
