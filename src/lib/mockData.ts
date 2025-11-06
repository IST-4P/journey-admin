// Mock data for HacMieu Journey Admin Dashboard

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  trustScore: number;
  registrationDate: string;
  avatar?: string;
  licenseVerified: boolean;
  licenseImages?: string[]; // Hình ảnh GPLX
  addresses: string[];
  bankAccount?: string;
}

export interface Vehicle {
  id: number;
  name: string;
  type: 'car' | 'motorbike';
  price: number;
  location: string;
  status: 'available' | 'rented' | 'maintenance';
  seats?: number;
  fuel: string;
  description: string;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
}

// Booking/Rental types based on Prisma schema
export type BookingStatus = 
  | 'PENDING' 
  | 'DEPOSIT_PAID' 
  | 'FULLY_PAID' 
  | 'ONGOING' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'OVERDUE';

export type HistoryAction = 
  | 'CREATED'
  | 'DEPOSIT_PAID'
  | 'FULLY_PAID'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'EXTENSION_REQUESTED'
  | 'EXTENSION_APPROVED';

export type ExtensionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type CheckType = 'CHECK_IN' | 'CHECK_OUT';

export interface CheckInOut {
  id: string;
  userId: string;
  userName: string;
  bookingId: string;
  type: CheckType;
  latitude: number;
  longitude: number;
  address: string;
  images: string[];
  mileage: number;
  fuelLevel: number;
  damageNotes?: string;
  damageImages: string[];
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingHistory {
  id: string;
  bookingId: string;
  action: HistoryAction;
  notes?: string;
  createdAt: string;
}

export interface BookingExtension {
  id: string;
  bookingId: string;
  requestedBy: string;
  requestedByName: string;
  originalEndTime: string;
  newEndTime: string;
  additionalHours: number;
  additionalAmount: number;
  status: ExtensionStatus;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface Rental {
  id: string;
  userId: string;
  userName: string;
  vehicleId: number;
  vehicleName: string;
  vehicleType: 'car' | 'motorbike';
  status: BookingStatus;
  
  // Thời gian
  startTime: string;
  endTime: string;
  duration: number; // hours
  
  // Địa chỉ
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  
  // Chi phí
  vehicleFeeHour: number;
  rentalFee: number;
  insuranceFee: number;
  vat: number;
  discount: number;
  deposit: number;
  collateral: number;
  totalAmount: number;
  refundAmount: number;
  
  // Penalties
  penaltyAmount: number;
  damageAmount: number;
  overtimeAmount: number;
  
  // Payment
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  paidAt?: string;
  
  // Notes
  notes?: string;
  cancelReason?: string;
  adminNotes?: string;
  damageReported: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  expiredAt?: string;
  
  // Relations
  history?: BookingHistory[];
  checkIns?: CheckInOut[];
  extensions?: BookingExtension[];
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  itemId: number; // ID của xe/thiết bị/combo
  itemName: string;
  title: string; // Tiêu đề đánh giá
  rating: number;
  comment: string;
  images?: string[]; // Hình ảnh đánh giá
  date: string;
  updatedDate: string; // Ngày chỉnh sửa
  type: 'car' | 'motorbike' | 'equipment' | 'combo'; // Ô tô, Xe máy, Thiết bị, Combo
}

export interface Notification {
  id: number;
  content: string;
  recipient: string;
  dateSent: string;
  status: 'sent' | 'pending';
}

export interface Conversation {
  id: number;
  userId: number;
  userName: string;
  lastMessage: string;
  lastMessageDate: string;
  unread: number;
}

export interface Message {
  id: number;
  conversationId: number;
  sender: 'admin' | 'user';
  content: string;
  timestamp: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  user: string;
  timestamp: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  author: string;
  authorId: number;
  content: string;
  excerpt: string; // Tóm tắt
  region: string; // Khu vực
  category: 'news' | 'guide' | 'promotion' | 'announcement';
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  updatedDate: string;
  featuredImage?: string;
  tags: string[];
  viewCount: number;
  allowComments: boolean;
}

// Equipment interface
export interface Equipment {
  id: number;
  name: string;
  brand?: string;
  category: string; // Danh mục
  description?: string;
  price: number;
  information?: string[]; // Thông tin kỹ thuật
  quantity?: number;
  status: 'available' | 'rented' | 'maintenance';
  images?: string[];
}

// Combo interface
export interface Combo {
  id: number;
  name: string;
  price: number;
  description?: string;
  images?: string[];
  devices: ComboDevice[]; // Các thiết bị trong combo
  createdAt: string;
  updatedAt: string;
}

export interface ComboDevice {
  id: number;
  deviceId: number;
  deviceName: string;
  quantity: number;
}

// Equipment Booking types
export type EquipmentBookingStatus = 
  | 'PENDING' 
  | 'CONFIRMED'
  | 'READY_FOR_PICKUP'
  | 'ONGOING' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'OVERDUE';

export interface EquipmentBookingItem {
  id: string;
  equipmentId?: number;
  comboId?: number;
  name: string;
  type: 'equipment' | 'combo';
  quantity: number;
  pricePerDay: number;
  totalPrice: number;
}

export interface EquipmentBookingHistory {
  id: string;
  bookingId: string;
  action: HistoryAction;
  notes?: string;
  createdAt: string;
}

export interface EquipmentBookingExtension {
  id: string;
  bookingId: string;
  requestedBy: string;
  requestedByName: string;
  originalEndTime: string;
  newEndTime: string;
  additionalDays: number;
  additionalAmount: number;
  status: ExtensionStatus;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
}

export interface EquipmentCheckInOut {
  id: string;
  userId: string;
  userName: string;
  bookingId: string;
  type: CheckType;
  images: string[];
  notes?: string;
  damageNotes?: string;
  damageImages: string[];
  verified: boolean;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentBooking {
  id: string;
  userId: string;
  userName: string;
  status: EquipmentBookingStatus;
  
  // Items
  items: EquipmentBookingItem[];
  
  // Thời gian
  startTime: string;
  endTime: string;
  duration: number; // days
  
  // Địa chỉ
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  
  // Chi phí
  itemsTotal: number;
  deliveryFee: number;
  vat: number;
  discount: number;
  deposit: number;
  totalAmount: number;
  refundAmount: number;
  
  // Penalties
  penaltyAmount: number;
  damageAmount: number;
  overtimeAmount: number;
  
  // Payment
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';
  paidAt?: string;
  
  // Notes
  notes?: string;
  cancelReason?: string;
  adminNotes?: string;
  damageReported: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  
  // Relations
  history?: EquipmentBookingHistory[];
  checkIns?: EquipmentCheckInOut[];
  extensions?: EquipmentBookingExtension[];
}

// Generate mock users
export const mockUsers: User[] = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `Người Dùng ${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `098${String(i + 1).padStart(7, '0')}`,
  status: ['active', 'inactive', 'suspended'][i % 3] as any,
  trustScore: Math.floor(Math.random() * 100),
  registrationDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  licenseVerified: i % 2 === 0,
  licenseImages: i % 2 === 0 ? [
    `https://images.unsplash.com/photo-${1600000000000 + i * 1000}`,
    `https://images.unsplash.com/photo-${1600000000000 + i * 1000 + 500}`
  ] : undefined,
  addresses: [`${i + 1} Đường ABC, Quận ${(i % 12) + 1}, TP.HCM`],
  bankAccount: i % 2 === 0 ? `1234567890${i}` : undefined,
}));

// Generate mock vehicles
export const mockVehicles: Vehicle[] = Array.from({ length: 38 }, (_, i) => ({
  id: i + 1,
  name: i % 2 === 0 ? `Toyota Vios ${i + 1}` : `Honda SH ${i + 1}`,
  type: i % 2 === 0 ? 'car' : 'motorbike',
  price: i % 2 === 0 ? 500000 + (i * 10000) : 150000 + (i * 5000),
  location: `Quận ${(i % 12) + 1}, TP.HCM`,
  status: ['available', 'rented', 'maintenance'][i % 3] as any,
  seats: i % 2 === 0 ? 4 : undefined,
  fuel: i % 2 === 0 ? 'Xăng' : 'Xăng',
  description: `Xe ${i % 2 === 0 ? 'ô tô' : 'máy'} chất lượng cao, bảo dưỡng định kỳ.`,
  images: [`https://images.unsplash.com/photo-${1500000000000 + i}`],
  amenities: ['Bluetooth', 'GPS', 'Camera lùi'],
  pricePerHour: i % 2 === 0 ? 50000 : 20000,
  pricePerDay: i % 2 === 0 ? 500000 : 150000,
  pricePerMonth: i % 2 === 0 ? 12000000 : 3500000,
}));

// Generate mock rentals (Vehicle bookings only)
const bookingStatuses: BookingStatus[] = [
  'PENDING', 'DEPOSIT_PAID', 'FULLY_PAID', 'ONGOING', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'OVERDUE'
];

export const mockRentals: Rental[] = Array.from({ length: 52 }, (_, i) => {
  const vehicleType = i % 2 === 0 ? 'car' : 'motorbike';
  const status = bookingStatuses[i % bookingStatuses.length];
  const startTime = new Date(2025, 0, (i % 28) + 1, 9, 0);
  const durationHours = vehicleType === 'car' ? (i % 3 + 1) * 24 : (i % 5 + 1) * 24; // 1-3 days for car, 1-5 days for bike
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
  
  const vehicleFeeHour = vehicleType === 'car' ? 50000 : 15000;
  const rentalFee = vehicleFeeHour * durationHours;
  const insuranceFee = vehicleType === 'car' ? 100000 : 50000;
  const vat = Math.floor((rentalFee + insuranceFee) * 0.1);
  const discount = i % 5 === 0 ? 50000 : 0;
  const deposit = 500000;
  const collateral = 3000000;
  const totalAmount = rentalFee + insuranceFee + vat - discount + deposit + collateral;
  
  const penaltyAmount = status === 'OVERDUE' ? 200000 : 0;
  const damageAmount = i % 7 === 0 ? 500000 : 0;
  const overtimeAmount = status === 'OVERDUE' ? 100000 * (i % 3 + 1) : 0;
  
  return {
    id: `booking-${i + 1}`,
    userId: `user-${(i % 45) + 1}`,
    userName: `Người Dùng ${(i % 45) + 1}`,
    vehicleId: (i % 38) + 1,
    vehicleName: vehicleType === 'car' ? `Toyota Vios ${(i % 20) + 1}` : `Honda SH ${(i % 20) + 1}`,
    vehicleType,
    status,
    
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: durationHours,
    
    pickupAddress: `${i + 100} Đường Nguyễn Văn Linh, Quận ${(i % 12) + 1}, TP.HCM`,
    pickupLat: 10.7769 + (Math.random() - 0.5) * 0.1,
    pickupLng: 106.7009 + (Math.random() - 0.5) * 0.1,
    
    vehicleFeeHour,
    rentalFee,
    insuranceFee,
    vat,
    discount,
    deposit,
    collateral,
    totalAmount,
    refundAmount: status === 'COMPLETED' ? deposit + collateral - penaltyAmount - damageAmount - overtimeAmount : 0,
    
    penaltyAmount,
    damageAmount,
    overtimeAmount,
    
    paymentStatus: status === 'PENDING' ? 'PENDING' : status === 'DEPOSIT_PAID' ? 'PAID' : status === 'FULLY_PAID' ? 'PAID' : status === 'COMPLETED' ? 'PAID' : 'PENDING',
    paidAt: ['DEPOSIT_PAID', 'FULLY_PAID', 'ONGOING', 'COMPLETED'].includes(status) 
      ? new Date(startTime.getTime() - 24 * 60 * 60 * 1000).toISOString() 
      : undefined,
    
    notes: i % 3 === 0 ? `Ghi chú của khách hàng ${i + 1}` : undefined,
    cancelReason: status === 'CANCELLED' ? 'Khách hủy do thay đổi kế hoạch' : undefined,
    adminNotes: i % 5 === 0 ? `Ghi chú admin ${i + 1}` : undefined,
    damageReported: damageAmount > 0,
    
    createdAt: new Date(startTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(startTime.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    cancelledAt: status === 'CANCELLED' ? new Date(startTime.getTime() - 12 * 60 * 60 * 1000).toISOString() : undefined,
    expiredAt: status === 'EXPIRED' ? new Date(startTime.getTime() + 1 * 60 * 60 * 1000).toISOString() : undefined,
  };
});

// Generate booking history
export const mockBookingHistory: BookingHistory[] = mockRentals.flatMap((rental) => {
  const histories: BookingHistory[] = [
    {
      id: `history-${rental.id}-1`,
      bookingId: rental.id,
      action: 'CREATED',
      notes: 'Đơn thuê được tạo',
      createdAt: rental.createdAt,
    },
  ];
  
  if (rental.status !== 'PENDING' && rental.status !== 'EXPIRED') {
    histories.push({
      id: `history-${rental.id}-2`,
      bookingId: rental.id,
      action: 'DEPOSIT_PAID',
      notes: 'Đã thanh toán tiền cọc',
      createdAt: rental.paidAt || rental.createdAt,
    });
  }
  
  if (['FULLY_PAID', 'ONGOING', 'COMPLETED'].includes(rental.status)) {
    histories.push({
      id: `history-${rental.id}-3`,
      bookingId: rental.id,
      action: 'FULLY_PAID',
      notes: 'Đã thanh toán đầy đủ',
      createdAt: new Date(new Date(rental.startTime).getTime() - 2 * 60 * 60 * 1000).toISOString(),
    });
  }
  
  if (['ONGOING', 'COMPLETED', 'OVERDUE'].includes(rental.status)) {
    histories.push({
      id: `history-${rental.id}-4`,
      bookingId: rental.id,
      action: 'CHECKED_IN',
      notes: 'Đã nhận xe',
      createdAt: rental.startTime,
    });
  }
  
  if (rental.status === 'COMPLETED') {
    histories.push({
      id: `history-${rental.id}-5`,
      bookingId: rental.id,
      action: 'CHECKED_OUT',
      notes: 'Đã trả xe',
      createdAt: rental.endTime,
    });
  }
  
  if (rental.status === 'CANCELLED') {
    histories.push({
      id: `history-${rental.id}-cancel`,
      bookingId: rental.id,
      action: 'CANCELLED',
      notes: rental.cancelReason || 'Đơn thuê đã bị hủy',
      createdAt: rental.cancelledAt || rental.updatedAt,
    });
  }
  
  return histories;
});

// Generate check-in/check-out records
export const mockCheckInOuts: CheckInOut[] = mockRentals
  .filter((r) => ['ONGOING', 'COMPLETED', 'OVERDUE'].includes(r.status))
  .flatMap((rental) => {
    const checkIns: CheckInOut[] = [
      {
        id: `checkin-${rental.id}`,
        userId: rental.userId,
        userName: rental.userName,
        bookingId: rental.id,
        type: 'CHECK_IN',
        latitude: rental.pickupLat,
        longitude: rental.pickupLng,
        address: rental.pickupAddress,
        images: Array.from({ length: 5 }, (_, i) => 
          `https://images.unsplash.com/photo-${1600000000000 + parseInt(rental.id.split('-')[1]) * 100 + i}`
        ),
        mileage: 10000 + parseInt(rental.id.split('-')[1]) * 500,
        fuelLevel: 100,
        damageNotes: undefined,
        damageImages: [],
        verified: true,
        verifiedAt: rental.startTime,
        createdAt: rental.startTime,
        updatedAt: rental.startTime,
      },
    ];
    
    if (rental.status === 'COMPLETED') {
      checkIns.push({
        id: `checkout-${rental.id}`,
        userId: rental.userId,
        userName: rental.userName,
        bookingId: rental.id,
        type: 'CHECK_OUT',
        latitude: rental.pickupLat + 0.01,
        longitude: rental.pickupLng + 0.01,
        address: rental.pickupAddress,
        images: Array.from({ length: 6 }, (_, i) => 
          `https://images.unsplash.com/photo-${1610000000000 + parseInt(rental.id.split('-')[1]) * 100 + i}`
        ),
        mileage: 10000 + parseInt(rental.id.split('-')[1]) * 500 + rental.duration * 30,
        fuelLevel: 80,
        damageNotes: rental.damageReported ? 'Có vết xước nhỏ ở cửa sau bên phải' : undefined,
        damageImages: rental.damageReported ? [
          `https://images.unsplash.com/photo-${1615000000000 + parseInt(rental.id.split('-')[1]) * 100}`
        ] : [],
        verified: true,
        verifiedAt: rental.endTime,
        createdAt: rental.endTime,
        updatedAt: rental.endTime,
      });
    }
    
    return checkIns;
  });

// Generate booking extensions
export const mockBookingExtensions: BookingExtension[] = mockRentals
  .filter((_, i) => i % 6 === 0) // About 1/6 of bookings have extension requests
  .map((rental, idx) => ({
    id: `ext-${rental.id}`,
    bookingId: rental.id,
    requestedBy: rental.userId,
    requestedByName: rental.userName,
    originalEndTime: rental.endTime,
    newEndTime: new Date(new Date(rental.endTime).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    additionalHours: 24,
    additionalAmount: rental.vehicleFeeHour * 24,
    status: (['PENDING', 'APPROVED', 'REJECTED'] as ExtensionStatus[])[idx % 3],
    rejectionReason: idx % 3 === 2 ? 'Xe đã có lịch thuê tiếp theo' : undefined,
    notes: 'Muốn gia hạn thêm 1 ngày',
    createdAt: new Date(new Date(rental.endTime).getTime() - 6 * 60 * 60 * 1000).toISOString(),
  }));

// ==================== EQUIPMENT BOOKINGS ====================

// Generate mock equipment bookings
const equipmentBookingStatuses: EquipmentBookingStatus[] = [
  'PENDING', 'CONFIRMED', 'READY_FOR_PICKUP', 'ONGOING', 'COMPLETED', 'CANCELLED', 'OVERDUE'
];

export const mockEquipmentBookings: EquipmentBooking[] = Array.from({ length: 45 }, (_, i) => {
  const status = equipmentBookingStatuses[i % equipmentBookingStatuses.length];
  const startTime = new Date(2025, 0, (i % 28) + 1, 9, 0);
  const durationDays = (i % 5) + 1; // 1-5 days
  const endTime = new Date(startTime.getTime() + durationDays * 24 * 60 * 60 * 1000);
  
  // Generate items (equipment or combo)
  const itemsCount = (i % 3) + 1; // 1-3 items
  const items: EquipmentBookingItem[] = Array.from({ length: itemsCount }, (_, idx) => {
    const isCombo = idx % 2 === 0;
    const itemId = (i * 3 + idx) % 15 + 1;
    const pricePerDay = isCombo ? 200000 + idx * 50000 : 50000 + idx * 20000;
    const quantity = (idx % 2) + 1;
    
    return {
      id: `item-${i}-${idx}`,
      equipmentId: !isCombo ? itemId : undefined,
      comboId: isCombo ? itemId : undefined,
      name: isCombo ? `Combo ${itemId}` : `Thiết Bị ${itemId}`,
      type: isCombo ? 'combo' : 'equipment',
      quantity,
      pricePerDay,
      totalPrice: pricePerDay * quantity * durationDays,
    };
  });
  
  const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = 50000;
  const vat = Math.floor((itemsTotal + deliveryFee) * 0.1);
  const discount = i % 5 === 0 ? 30000 : 0;
  const deposit = 200000;
  const totalAmount = itemsTotal + deliveryFee + vat - discount + deposit;
  
  const penaltyAmount = status === 'OVERDUE' ? 100000 : 0;
  const damageAmount = i % 8 === 0 ? 150000 : 0;
  const overtimeAmount = status === 'OVERDUE' ? 50000 * (i % 3 + 1) : 0;
  
  return {
    id: `eq-booking-${i + 1}`,
    userId: `user-${(i % 45) + 1}`,
    userName: `Người Dùng ${(i % 45) + 1}`,
    status,
    
    items,
    
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: durationDays,
    
    deliveryAddress: `${i + 100} Đường Lê Lợi, Quận ${(i % 12) + 1}, TP.HCM`,
    deliveryLat: 10.7769 + (Math.random() - 0.5) * 0.1,
    deliveryLng: 106.7009 + (Math.random() - 0.5) * 0.1,
    
    itemsTotal,
    deliveryFee,
    vat,
    discount,
    deposit,
    totalAmount,
    refundAmount: status === 'COMPLETED' ? deposit - penaltyAmount - damageAmount - overtimeAmount : 0,
    
    penaltyAmount,
    damageAmount,
    overtimeAmount,
    
    paymentStatus: status === 'PENDING' ? 'PENDING' : status === 'CONFIRMED' ? 'PAID' : status === 'COMPLETED' ? 'PAID' : 'PENDING',
    paidAt: ['CONFIRMED', 'READY_FOR_PICKUP', 'ONGOING', 'COMPLETED'].includes(status) 
      ? new Date(startTime.getTime() - 24 * 60 * 60 * 1000).toISOString() 
      : undefined,
    
    notes: i % 3 === 0 ? `Ghi chú của khách hàng ${i + 1}` : undefined,
    cancelReason: status === 'CANCELLED' ? 'Khách hủy do thay đổi kế hoạch' : undefined,
    adminNotes: i % 5 === 0 ? `Ghi chú admin ${i + 1}` : undefined,
    damageReported: damageAmount > 0,
    
    createdAt: new Date(startTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(startTime.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    cancelledAt: status === 'CANCELLED' ? new Date(startTime.getTime() - 12 * 60 * 60 * 1000).toISOString() : undefined,
  };
});

// Generate equipment booking history
export const mockEquipmentBookingHistory: EquipmentBookingHistory[] = mockEquipmentBookings.flatMap((booking) => {
  const histories: EquipmentBookingHistory[] = [
    {
      id: `eq-history-${booking.id}-1`,
      bookingId: booking.id,
      action: 'CREATED',
      notes: 'Đơn thuê được tạo',
      createdAt: booking.createdAt,
    },
  ];
  
  if (booking.status !== 'PENDING') {
    histories.push({
      id: `eq-history-${booking.id}-2`,
      bookingId: booking.id,
      action: 'DEPOSIT_PAID',
      notes: 'Đã thanh toán',
      createdAt: booking.paidAt || booking.createdAt,
    });
  }
  
  if (['ONGOING', 'COMPLETED'].includes(booking.status)) {
    histories.push({
      id: `eq-history-${booking.id}-3`,
      bookingId: booking.id,
      action: 'CHECKED_IN',
      notes: 'Đã nhận thiết bị',
      createdAt: booking.startTime,
    });
  }
  
  if (booking.status === 'COMPLETED') {
    histories.push({
      id: `eq-history-${booking.id}-4`,
      bookingId: booking.id,
      action: 'CHECKED_OUT',
      notes: 'Đã trả thiết bị',
      createdAt: booking.endTime,
    });
  }
  
  if (booking.status === 'CANCELLED') {
    histories.push({
      id: `eq-history-${booking.id}-cancel`,
      bookingId: booking.id,
      action: 'CANCELLED',
      notes: booking.cancelReason || 'Đơn thuê đã bị hủy',
      createdAt: booking.cancelledAt || booking.updatedAt,
    });
  }
  
  return histories;
});

// Generate equipment check-in/check-out records
export const mockEquipmentCheckInOuts: EquipmentCheckInOut[] = mockEquipmentBookings
  .filter((b) => ['ONGOING', 'COMPLETED', 'OVERDUE'].includes(b.status))
  .flatMap((booking) => {
    const checkIns: EquipmentCheckInOut[] = [
      {
        id: `eq-checkin-${booking.id}`,
        userId: booking.userId,
        userName: booking.userName,
        bookingId: booking.id,
        type: 'CHECK_IN',
        images: Array.from({ length: 4 }, (_, i) => 
          `https://images.unsplash.com/photo-${1620000000000 + parseInt(booking.id.split('-')[2]) * 100 + i}`
        ),
        notes: 'Thiết bị trong tình trạng tốt',
        damageNotes: undefined,
        damageImages: [],
        verified: true,
        verifiedAt: booking.startTime,
        createdAt: booking.startTime,
        updatedAt: booking.startTime,
      },
    ];
    
    if (booking.status === 'COMPLETED') {
      checkIns.push({
        id: `eq-checkout-${booking.id}`,
        userId: booking.userId,
        userName: booking.userName,
        bookingId: booking.id,
        type: 'CHECK_OUT',
        images: Array.from({ length: 4 }, (_, i) => 
          `https://images.unsplash.com/photo-${1625000000000 + parseInt(booking.id.split('-')[2]) * 100 + i}`
        ),
        notes: 'Trả thiết bị đầy đủ',
        damageNotes: booking.damageReported ? 'Có trầy xước nhẹ' : undefined,
        damageImages: booking.damageReported ? [
          `https://images.unsplash.com/photo-${1630000000000 + parseInt(booking.id.split('-')[2]) * 100}`
        ] : [],
        verified: true,
        verifiedAt: booking.endTime,
        createdAt: booking.endTime,
        updatedAt: booking.endTime,
      });
    }
    
    return checkIns;
  });

// Generate equipment booking extensions
export const mockEquipmentBookingExtensions: EquipmentBookingExtension[] = mockEquipmentBookings
  .filter((_, i) => i % 7 === 0) // About 1/7 of bookings have extension requests
  .map((booking, idx) => ({
    id: `eq-ext-${booking.id}`,
    bookingId: booking.id,
    requestedBy: booking.userId,
    requestedByName: booking.userName,
    originalEndTime: booking.endTime,
    newEndTime: new Date(new Date(booking.endTime).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    additionalDays: 2,
    additionalAmount: booking.itemsTotal / booking.duration * 2,
    status: (['PENDING', 'APPROVED', 'REJECTED'] as ExtensionStatus[])[idx % 3],
    rejectionReason: idx % 3 === 2 ? 'Thiết bị đã có lịch thuê tiếp theo' : undefined,
    notes: 'Muốn gia hạn thêm 2 ngày',
    createdAt: new Date(new Date(booking.endTime).getTime() - 12 * 60 * 60 * 1000).toISOString(),
  }));

// Generate mock reviews
export const mockReviews: Review[] = Array.from({ length: 50 }, (_, i) => {
  const type: Review['type'] = i % 4 === 0 ? 'car' : i % 4 === 1 ? 'motorbike' : i % 4 === 2 ? 'equipment' : 'combo';
  const date = new Date(2025, 0, (i % 28) + 1);
  const updatedDate = new Date(date.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000);
  
  return {
    id: i + 1,
    userId: (i % 45) + 1,
    userName: `Người Dùng ${(i % 45) + 1}`,
    itemId: (i % 20) + 1,
    itemName: type === 'car' 
      ? `Toyota Vios ${(i % 20) + 1}` 
      : type === 'motorbike'
      ? `Honda Wave ${(i % 20) + 1}`
      : type === 'equipment'
      ? `Thiết Bị ${(i % 20) + 1}`
      : `Combo ${(i % 20) + 1}`,
    title: `Đánh giá ${type === 'car' ? 'ô tô' : type === 'motorbike' ? 'xe máy' : type === 'equipment' ? 'thiết bị' : 'combo'} số ${i + 1}`,
    rating: (i % 5) + 1,
    comment: `${type === 'car' ? 'Ô tô' : type === 'motorbike' ? 'Xe máy' : type === 'equipment' ? 'Thiết bị' : 'Combo'} rất tốt, chủ nhiệt tình. Tôi rất hài lòng. ${i + 1}`,
    images: i % 3 === 0 ? [
      `https://images.unsplash.com/photo-${1550000000000 + i * 100}`,
      `https://images.unsplash.com/photo-${1550000000000 + i * 100 + 50}`
    ] : undefined,
    date: date.toISOString().split('T')[0],
    updatedDate: updatedDate.toISOString().split('T')[0],
    type,
  };
});

// Generate mock notifications
export const mockNotifications: Notification[] = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  content: `Thông báo số ${i + 1}: Cập nhật chính sách mới.`,
  recipient: i % 3 === 0 ? 'Tất cả' : `user${(i % 45) + 1}@example.com`,
  dateSent: new Date(2025, 0, (i % 28) + 1, 10, 0).toISOString(),
  status: i % 2 === 0 ? 'sent' : 'pending',
}));

// Generate mock conversations
export const mockConversations: Conversation[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  userId: (i % 45) + 1,
  userName: `Người Dùng ${(i % 45) + 1}`,
  lastMessage: `Tin nhắn cuối cùng từ cuộc trò chuyện ${i + 1}`,
  lastMessageDate: new Date(2025, 0, (i % 28) + 1, 14, 30).toISOString(),
  unread: i % 3,
}));

// Generate mock messages for a conversation
export const generateMockMessages = (conversationId: number): Message[] => {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    conversationId,
    sender: i % 2 === 0 ? 'user' : 'admin',
    content: `Tin nhắn ${i + 1} trong cuộc trò chuyện ${conversationId}`,
    timestamp: new Date(2025, 0, 19, 10 + i, 0).toISOString(),
  }));
};

// Generate mock activity logs
export const mockActivityLogs: ActivityLog[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  action: ['Đăng nhập', 'Tạo người dùng mới', 'Cập nhật xe', 'Xóa đánh giá', 'Phê duyệt đơn thuê'][i % 5],
  user: `Admin ${(i % 3) + 1}`,
  timestamp: new Date(2025, 0, (i % 28) + 1, 10 + (i % 12), 0).toISOString(),
}));

// Dashboard stats
export const dashboardStats = {
  newUsers: 125,
  activeRentals: 48,
  recentRevenue: 125000000,
  newReviews: 23,
};

// Monthly revenue data for chart
export const monthlyRevenue = [
  { month: 'T1', vehicleRevenue: 30000000, equipmentRevenue: 15000000, revenue: 45000000 },
  { month: 'T2', vehicleRevenue: 35000000, equipmentRevenue: 17000000, revenue: 52000000 },
  { month: 'T3', vehicleRevenue: 32000000, equipmentRevenue: 16000000, revenue: 48000000 },
  { month: 'T4', vehicleRevenue: 40000000, equipmentRevenue: 21000000, revenue: 61000000 },
  { month: 'T5', vehicleRevenue: 37000000, equipmentRevenue: 18000000, revenue: 55000000 },
  { month: 'T6', vehicleRevenue: 45000000, equipmentRevenue: 22000000, revenue: 67000000 },
  { month: 'T7', vehicleRevenue: 48000000, equipmentRevenue: 25000000, revenue: 73000000 },
  { month: 'T8', vehicleRevenue: 46000000, equipmentRevenue: 23000000, revenue: 69000000 },
  { month: 'T9', vehicleRevenue: 52000000, equipmentRevenue: 26000000, revenue: 78000000 },
  { month: 'T10', vehicleRevenue: 56000000, equipmentRevenue: 29000000, revenue: 85000000 },
  { month: 'T11', vehicleRevenue: 60000000, equipmentRevenue: 32000000, revenue: 92000000 },
  { month: 'T12', vehicleRevenue: 58000000, equipmentRevenue: 30000000, revenue: 88000000 },
];

// Popular items data (phương tiện và thiết bị)
export const popularItems = [
  { name: 'Ô tô', value: 35 },
  { name: 'Xe máy', value: 25 },
  { name: 'Thiết bị', value: 30 },
  { name: 'Combo', value: 10 },
];

// Revenue by business type
export const revenueByBusiness = [
  { name: 'Thuê Phương Tiện', value: 548000000 },
  { name: 'Thuê Thiết Bị', value: 274000000 },
];

// Cancellation rate data by business
export const cancellationRate = [
  { month: 'T1', vehicleRate: 5, equipmentRate: 3 },
  { month: 'T2', vehicleRate: 7, equipmentRate: 4 },
  { month: 'T3', vehicleRate: 4, equipmentRate: 2 },
  { month: 'T4', vehicleRate: 6, equipmentRate: 5 },
  { month: 'T5', vehicleRate: 3, equipmentRate: 2 },
  { month: 'T6', vehicleRate: 5, equipmentRate: 3 },
];

// Generate mock posts
const postCategories: Post['category'][] = ['news', 'guide', 'promotion', 'announcement'];
const postStatuses: Post['status'][] = ['draft', 'published', 'archived'];
const postTitles = [
  'Hướng dẫn thuê xe an toàn cho người mới',
  'Khuyến mãi giảm 20% cho khách hàng thân thiết',
  'Bí quyết tiết kiệm chi phí khi thuê xe dài hạn',
  'Cập nhật chính sách thuê xe mới năm 2025',
  'Top 10 địa điểm du lịch nên thuê xe máy',
  'Hướng dẫn sử dụng app HacMieu Journey',
  'Quy trình thuê xe đơn giản chỉ trong 3 bước',
  'Kinh nghiệm thuê thiết bị camping an toàn',
  'Thông báo bảo trì hệ thống định kỳ',
  'Giới thiệu tính năng mới: Chat trực tiếp',
];

const regions = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'];

export const mockPosts: Post[] = Array.from({ length: 47 }, (_, i) => {
  const publishDate = new Date(2025, Math.floor(Math.random() * 2), Math.floor(Math.random() * 28) + 1);
  const updatedDate = new Date(publishDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);
  
  return {
    id: i + 1,
    title: postTitles[i % postTitles.length] + ` ${Math.floor(i / postTitles.length) > 0 ? '- Phần ' + (Math.floor(i / postTitles.length) + 1) : ''}`,
    slug: `bai-viet-${i + 1}`,
    author: `Admin ${(i % 3) + 1}`,
    authorId: (i % 3) + 1,
    content: `Nội dung chi tiết của bài viết số ${i + 1}. Đây là một bài viết hữu ích về dịch vụ thuê xe và thiết bị của HacMieu Journey. Bài viết cung cấp thông tin chi tiết và hữu ích cho người dùng...`,
    excerpt: `Tóm tắt ngắn gọn của bài viết ${i + 1}. Đây là phần giới thiệu nội dung chính trong bài viết.`,
    region: regions[i % regions.length],
    category: postCategories[i % postCategories.length],
    status: postStatuses[i % postStatuses.length],
    publishDate: publishDate.toISOString().split('T')[0],
    updatedDate: updatedDate.toISOString().split('T')[0],
    featuredImage: i % 3 === 0 ? undefined : `https://images.unsplash.com/photo-${1500000000000 + i}`,
    tags: [
      ['thuê xe', 'hướng dẫn'][i % 2],
      ['khuyến mãi', 'tin tức', 'mẹo hay'][i % 3],
    ].filter(Boolean),
    viewCount: Math.floor(Math.random() * 5000) + 100,
    allowComments: i % 3 !== 0,
  };
});

// Generate mock equipment
const equipmentCategories = ['Camping', 'Photography', 'Sports', 'Electronics', 'Tools'];

export const mockEquipment: Equipment[] = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: `Thiết Bị ${equipmentCategories[i % equipmentCategories.length]} ${i + 1}`,
  brand: i % 2 === 0 ? ['Canon', 'Sony', 'Nikon', 'GoPro'][i % 4] : undefined,
  category: equipmentCategories[i % equipmentCategories.length],
  description: `Mô tả chi tiết cho thiết bị ${i + 1}. Thiết bị chất lượng cao, phù hợp cho nhiều mục đích sử dụng.`,
  price: (i + 1) * 50000,
  information: [
    'Công suất cao',
    'Tiết kiệm năng lượng',
    'Dễ sử dụng',
    'Bảo hành 12 tháng'
  ],
  quantity: Math.floor(Math.random() * 20) + 1,
  status: ['available', 'rented', 'maintenance'][i % 3] as any,
  images: [`https://images.unsplash.com/photo-${1520000000000 + i * 100}`],
}));

// Generate mock combos
export const mockCombos: Combo[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Combo ${['Camping Cơ Bản', 'Chụp Ảnh Chuyên Nghiệp', 'Thể Thao Ngoài Trời', 'Du Lịch Tiện Lợi', 'Công Nghệ Số'][i % 5]}`,
  price: (i + 1) * 200000,
  description: `Combo tiết kiệm bao gồm nhiều thiết bị hữu ích cho ${['camping', 'chụp ảnh', 'thể thao', 'du lịch', 'công việc'][i % 5]}.`,
  images: [`https://images.unsplash.com/photo-${1530000000000 + i * 100}`],
  devices: [
    { id: 1, deviceId: (i % 35) + 1, deviceName: `Thiết Bị ${(i % 35) + 1}`, quantity: 1 },
    { id: 2, deviceId: ((i + 5) % 35) + 1, deviceName: `Thiết Bị ${((i + 5) % 35) + 1}`, quantity: 2 },
  ],
  createdAt: new Date(2025, 0, (i % 28) + 1).toISOString(),
  updatedAt: new Date(2025, 0, (i % 28) + 1).toISOString(),
}));

// Payment interfaces and data
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type PaymentType = 'DEVICE' | 'VEHICLE';

export interface Payment {
  id: string;
  sequenceNumber: number;
  paymentCode: string;
  userId: string;
  userName: string;
  type: PaymentType;
  bookingId?: string;
  rentalId?: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export type RefundStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface Refund {
  id: string;
  userId: string;
  userName: string;
  paymentId: string;
  paymentCode: string;
  bookingId?: string;
  rentalId?: string;
  amount: number;
  penaltyAmount: number;
  damageAmount: number;
  overtimeAmount: number;
  finalAmount: number;
  status: RefundStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount?: string;
  amountIn: number;
  amountOut: number;
  accumulated: number;
  code?: string;
  transactionContent: string;
  referenceNumber?: string;
  body?: string;
  createdAt: string;
}

// Generate mock payments
const paymentStatuses: PaymentStatus[] = ['PENDING', 'PAID', 'FAILED'];
const paymentTypes: PaymentType[] = ['DEVICE', 'VEHICLE'];

export const mockPayments: Payment[] = Array.from({ length: 50 }, (_, i) => {
  const type = paymentTypes[i % 2];
  const status = paymentStatuses[i % 3];
  const sequenceNumber = i + 1;
  const paymentCode = `PAY${new Date().getFullYear()}${String(sequenceNumber).padStart(8, '0')}`;
  
  return {
    id: `pay-${i + 1}`,
    sequenceNumber,
    paymentCode,
    userId: `user-${(i % 20) + 1}`,
    userName: `Người Dùng ${(i % 20) + 1}`,
    type,
    bookingId: type === 'DEVICE' ? `booking-${i + 1}` : undefined,
    rentalId: type === 'VEHICLE' ? `rental-${i + 1}` : undefined,
    amount: (i + 1) * 100000 + Math.floor(Math.random() * 500000),
    status,
    createdAt: new Date(2025, 0, (i % 28) + 1, 10 + (i % 12), 0).toISOString(),
    updatedAt: new Date(2025, 0, (i % 28) + 1, 10 + (i % 12), 30).toISOString(),
  };
});

// Generate mock refunds
const refundStatuses: RefundStatus[] = ['PENDING', 'COMPLETED', 'CANCELLED'];

export const mockRefunds: Refund[] = Array.from({ length: 30 }, (_, i) => {
  const payment = mockPayments[i];
  const penaltyAmount = i % 3 === 0 ? 50000 : 0;
  const damageAmount = i % 5 === 0 ? 100000 : 0;
  const overtimeAmount = i % 4 === 0 ? 80000 : 0;
  const refundAmount = payment.amount * 0.8; // 80% của số tiền thanh toán
  const finalAmount = refundAmount - penaltyAmount - damageAmount - overtimeAmount;

  return {
    id: `refund-${i + 1}`,
    userId: payment.userId,
    userName: payment.userName,
    paymentId: payment.id,
    paymentCode: payment.paymentCode,
    bookingId: payment.bookingId,
    rentalId: payment.rentalId,
    amount: refundAmount,
    penaltyAmount,
    damageAmount,
    overtimeAmount,
    finalAmount,
    status: refundStatuses[i % 3],
    createdAt: new Date(2025, 0, (i % 28) + 1, 14 + (i % 8), 0).toISOString(),
    updatedAt: new Date(2025, 0, (i % 28) + 1, 14 + (i % 8), 30).toISOString(),
  };
});

// Generate mock transactions
const gateways = ['VietComBank', 'Techcombank', 'BIDV', 'VPBank', 'MBBank', 'ACB'];

export const mockTransactions: PaymentTransaction[] = Array.from({ length: 80 }, (_, i) => {
  const isIncome = i % 3 !== 0; // 2/3 giao dịch là thu, 1/3 là chi
  const amount = (i + 1) * 50000 + Math.floor(Math.random() * 500000);
  
  return {
    id: i + 1,
    gateway: gateways[i % gateways.length],
    transactionDate: new Date(2025, 0, (i % 28) + 1, 8 + (i % 14), (i * 7) % 60).toISOString(),
    accountNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    subAccount: i % 2 === 0 ? `SUB${i + 1}` : undefined,
    amountIn: isIncome ? amount : 0,
    amountOut: isIncome ? 0 : amount,
    accumulated: (i + 1) * 1000000,
    code: `TXN${new Date().getFullYear()}${String(i + 1).padStart(6, '0')}`,
    transactionContent: isIncome 
      ? `Thanh toan don hang PAY${new Date().getFullYear()}${String((i % 50) + 1).padStart(8, '0')}`
      : `Hoan tien don hang REFUND${i + 1}`,
    referenceNumber: `REF${Date.now()}${i}`,
    body: JSON.stringify({ 
      transactionId: i + 1, 
      gateway: gateways[i % gateways.length],
      timestamp: new Date().toISOString()
    }),
    createdAt: new Date(2025, 0, (i % 28) + 1, 8 + (i % 14), (i * 7) % 60).toISOString(),
  };
});
