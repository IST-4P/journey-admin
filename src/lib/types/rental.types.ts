/**
 * Rental Types - for equipment/device rentals
 */

export type RentalStatus = 'EXPIRED' | 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Device {
  id: string;
  name: string;
  price: number;
  description: string;
  status: string;
  quantity: number;
  information: string[];
  images: string[];
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface RentalItem {
  targetId: string;
  quantity: number;
  name: string;
  unitPrice: number;
  subtotal: number;
  detail: {
    device: Device;
  };
}

export interface Rental {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  items?: RentalItem[];
  status: RentalStatus;
  rentalFee?: number;
  deposit?: number;
  totalPrice?: number;
  totalQuantity?: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  actualEndDate?: string;
  reviewId?: string;
  maxDiscount?: number;
  discountPercent?: number;
}

export interface RentalListResponse {
  data: {
    rentals: Rental[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}

export interface RentalExtension {
  id: string;
  rentalId: string;
  newEndDate: string;
  additionalDays?: number; // Optional since API doesn't return it
  totalPrice?: number; // Optional since API doesn't return it
  requestedBy: string;
  createdAt: string;
  notes?: string; // Add notes field
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface RentalDetailResponse {
  data: Rental;
  message: string;
  statusCode: number;
}
