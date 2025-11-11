import axiosInstance from "../axios";
import type {
  GetManyRefundsRequest,
  GetManyRefundsResponse,
  GetRefundResponse,
} from "../types/refund.types";

/**
 * Refund Service
 * Handles all refund-related API calls
 */

/**
 * Get list of refunds with pagination and filters
 */
export const getManyRefunds = async (
  params?: GetManyRefundsRequest
): Promise<GetManyRefundsResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get("/refund", { params });
};

/**
 * Get a single refund by ID
 */
export const getRefund = async (id: string): Promise<GetRefundResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get(`/refund/${id}`);
};
