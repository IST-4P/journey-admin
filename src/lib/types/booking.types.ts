// Booking types based on API response
export type BookingStatus =
  | "PENDING"
  | "PENDING_VERIFY"
  | "DEPOSIT_PAID"
  | "READY_FOR_CHECKIN"
  | "FULLY_PAID"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "OVERDUE";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  status: BookingStatus;
  startTime: string;
  endTime: string;
  duration: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  vehicleFeeHour: number;
  rentalFee: number;
  insuranceFee: number;
  vat: number;
  discount: number;
  deposit: number;
  collateral: number;
  totalAmount: number;
  refundAmount: number;
  penaltyAmount: number;
  damageAmount: number;
  overtimeAmount: number;
  paymentStatus: PaymentStatus;
  notes: string;
  damageReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  vehicleId?: string;
  startTimeFrom?: string;
  startTimeTo?: string;
}

export interface GetBookingsResponse {
  bookings: Booking[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export type CheckInOutType = "CHECK_IN" | "CHECK_OUT";

export interface CheckInOut {
  id: string;
  bookingId: string;
  type: CheckInOutType;
  userId: string;
  mileage: number;
  fuelLevel: number;
  address: string;
  latitude: number;
  longitude: number;
  images: string[];
  damageNotes?: string;
  damageImages: string[];
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInOutPair {
  checkIn?: CheckInOut | null;
  checkOut?: CheckInOut | null;
}

export interface GetCheckInOutsResponse {
  checkInOuts: CheckInOut[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export type ExtensionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Extension {
  id: string;
  bookingId: string;
  requestedBy: string;
  originalEndTime: string;
  newEndTime: string;
  additionalHours: number;
  additionalAmount: number;
  status: ExtensionStatus;
  notes?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetExtensionListParams {
  page?: number;
  limit?: number;
  status?: ExtensionStatus;
  bookingId?: string;
}

export interface GetExtensionListResponse {
  extensions: Extension[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface BookingHistory {
  id: string;
  bookingId: string;
  action: string;
  notes?: string;
  createdAt: string;
}

export interface GetHistoriesResponse {
  histories: BookingHistory[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface BookingStatistics {
  totalBookings: number;
  pendingBookings: number;
  ongoingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}
