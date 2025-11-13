import axiosInstance from "../axios";
import type {
  GetManyTransactionsRequest,
  GetManyTransactionsResponse,
  GetTransactionResponse,
} from "../types/transaction.types";

/**
 * Transaction Service
 * Handles all transaction-related API calls
 */

/**
 * Get list of transactions with pagination and filters
 */
export const getManyTransactions = async (
  params?: GetManyTransactionsRequest
): Promise<GetManyTransactionsResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get("/transaction", { params });
};

/**
 * Get a single transaction by ID
 */
export const getTransaction = async (id: number): Promise<GetTransactionResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get(`/transaction/${id}`);
};
