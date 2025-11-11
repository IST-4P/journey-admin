import axiosInstance from "../axios";
import type {
  GetManyPaymentsRequest,
  GetManyPaymentsResponse,
  GetPaymentResponse,
} from "../types/payment.types";

/**
 * Payment Service
 * Handles all payment-related API calls
 */

/**
 * Get list of payments with pagination and filters
 */
export const getManyPayments = async (
  params?: GetManyPaymentsRequest
): Promise<GetManyPaymentsResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get("/payment", { params });
};

/**
 * Get a single payment by ID
 */
export const getPayment = async (id: string): Promise<GetPaymentResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get(`/payment/${id}`);
};
