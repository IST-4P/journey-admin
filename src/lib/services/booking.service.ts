import axios from '../axios';
import type { GetBookingsParams, GetBookingsResponse, Booking } from '../types/booking.types';

const BASE_URL = '/booking';

/**
 * Get multiple bookings with pagination and filters
 */
export async function getManyBookings(params: GetBookingsParams): Promise<GetBookingsResponse> {
  // axios interceptor đã unwrap response.data.data thành response
  const response = await axios.get(BASE_URL, { params });
  console.log('Bookings response:', response);
  return response as any;
}

/**
 * Get a single booking by ID
 */
export async function getBookingById(id: string): Promise<Booking> {
  // axios interceptor đã unwrap response.data.data thành response
  const response = await axios.get(`${BASE_URL}/${id}`);
  console.log('Booking detail response:', response);
  return response as any;
}

/**
 * Update booking status
 */
export async function updateBookingStatus(id: string, status: string): Promise<Booking> {
  const response = await axios.patch(`${BASE_URL}/${id}/status`, { status });
  return response.data.data;
}

/**
 * Cancel booking
 */
export async function cancelBooking(id: string, reason?: string): Promise<Booking> {
  const response = await axios.post(`${BASE_URL}/${id}/cancel`, { reason });
  return response.data.data;
}

/**
 * Get booking statistics
 */
export async function getBookingStats() {
  const response: any = await axios.get(`${BASE_URL}/information`);
  console.log('Booking stats response:', response);
  return response;
}

/**
 * Get check-in/out records for a booking
 */
export async function getCheckInOutsByBookingId(bookingId: string) {
  const response: any = await axios.get(`/check`, {
    params: { bookingId }
  });
  console.log('Check-in/out response:', response);
  // Response structure: { checkInOuts: [], page, limit, totalItems, totalPages }
  return response?.checkInOuts || [];
}

/**
 * Verify a check-in/out record
 */
export async function verifyCheckInOut(checkInOutId: string) {
  const response: any = await axios.post(`/check/verify/${checkInOutId}`);
  return response;
}

/**
 * Get booking history
 */
export async function getBookingHistory(bookingId: string) {
  const response: any = await axios.get(`/history`, {
    params: { bookingId }
  });
  console.log('Booking history response:', response);
  return response?.histories || [];
}

/**
 * Get extensions for a booking
 */
export async function getExtensionsByBookingId(bookingId: string) {
  const response = await axios.get(`/extension/${bookingId}`);
  return response as any;
}

/**
 * Approve an extension
 */
export async function approveExtension(extensionId: string) {
  const response = await axios.post(`/extension/approve/${extensionId}`);
  return response as any;
}

/**
 * Reject an extension
 */
export async function rejectExtension(extensionId: string, reason: string) {
  const response = await axios.post(`/extension/reject/${extensionId}`, { reason });
  return response as any;
}
