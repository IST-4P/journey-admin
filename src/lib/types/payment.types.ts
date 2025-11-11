/**
 * Payment Types
 * Type definitions for payment-related data structures
 */

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type PaymentType = 'DEVICE' | 'VEHICLE';

/**
 * Payment interface from API
 */
export interface Payment {
  id: string;
  sequenceNumber: number;
  paymentCode: string;
  userId: string;
  type: PaymentType;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request parameters for getting many payments
 */
export interface GetManyPaymentsRequest {
  limit?: number;
  page?: number;
  status?: PaymentStatus;
  type?: PaymentType;
  paymentCode?: string;
}

/**
 * Response for getting many payments
 */
export interface GetManyPaymentsResponse {
  payments: Payment[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Response for getting a single payment
 */
export type GetPaymentResponse = Payment;
