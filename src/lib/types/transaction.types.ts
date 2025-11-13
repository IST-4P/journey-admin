/**
 * Transaction Types
 * Type definitions for transaction-related data structures
 */

/**
 * Transaction interface from API
 */
export interface Transaction {
  id: number;
  code: string;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  amountIn: number;
  amountOut: number;
  transactionContent: string;
}

/**
 * Request parameters for getting many transactions
 */
export interface GetManyTransactionsRequest {
  limit?: number;
  page?: number;
  gateway?: string;
  type?: 'IN' | 'OUT'; // IN = tiền vào, OUT = tiền ra
  code?: string; // Search by transaction code
  startDate?: string; // ISO-8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
  endDate?: string; // ISO-8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
}

/**
 * Response for getting many transactions
 */
export interface GetManyTransactionsResponse {
  transactions: Transaction[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Response for getting a single transaction
 */
export type GetTransactionResponse = Transaction;
