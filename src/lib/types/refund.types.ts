/**
 * Refund Types
 * Type definitions for refund-related data structures
 */

export type RefundStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

/**
 * Refund interface from API
 */
export interface Refund {
  id: string;
  userId: string;
  bookingId: string;
  principal: number;
  amount: number;
  penaltyAmount: number;
  damageAmount: number;
  overtimeAmount: number;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request parameters for getting many refunds
 */
export interface GetManyRefundsRequest {
  limit?: number;
  page?: number;
  status?: RefundStatus;
  search?: string;
}

/**
 * Response for getting many refunds
 */
export interface GetManyRefundsResponse {
  refunds: Refund[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Response for getting a single refund
 */
export type GetRefundResponse = Refund;
