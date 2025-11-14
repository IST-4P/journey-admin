// Enums
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Role = "USER" | "ADMIN" | "SUPER_ADMIN";
export type LicenseClass = "A1" | "A2" | "B1" | "B2" | "C" | "D" | "E" | "F";

// Profile
export interface Profile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: Role;
  gender: Gender;
  avatarUrl: string;
  facebookUrl?: string | null;
  creditScore: number;
  bio: string;
  birthDate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  driverLicense?: DriverLicense | null;
  bankAccount?: BankAccount | null;
}

// Get All Profiles
export interface GetAllProfilesRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: Role;
  page?: number;
  limit?: number;
}

export interface GetAllProfilesResponse {
  profiles: Profile[];
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Get Profile
export interface GetProfileRequest {
  userId: string;
}

export type GetProfileResponse = Profile;

// Update Profile
export interface UpdateProfileRequest {
  userId: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  facebookUrl?: string;
  bio?: string;
  birthDate?: Date | string;
  gender?: Gender;
}

// Driver License
export interface DriverLicense {
  id: string;
  userId: string;
  licenseNumber: string;
  fullName: string;
  dateOfBirth: Date | string;
  licenseClass: LicenseClass;
  issueDate: Date | string;
  expiryDate: Date | string;
  issuePlace: string;
  frontImageUrl: string;
  backImageUrl: string;
  selfieImageUrl: string;
  isVerified: boolean;
  rejectedReason?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateDriverLicenseRequest {
  userId: string;
  licenseNumber?: string;
  fullName?: string;
  dateOfBirth?: Date | string;
  licenseClass?: LicenseClass;
  issueDate?: Date | string;
  expiryDate?: Date | string;
  issuePlace?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  selfieImageUrl?: string;
}

export interface VerifyDriverLicenseRequest {
  userId: string;
  isVerified: boolean;
  rejectedReason?: string;
}

// Bank Account
export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateBankAccountRequest {
  userId: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
}

// Address
export interface Address {
  id: string;
  userId: string;
  label: string;
  city: string;
  ward: string;
  detail: string;
  latitude: number;
  longitude: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UpdateAddressRequest {
  userId: string;
  id: string;
  label?: string;
  city?: string;
  ward?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
}
