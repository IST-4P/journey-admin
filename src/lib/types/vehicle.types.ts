// TypeScript types for Vehicle API based on domain schemas

// Type definitions
export type VehicleType = "CAR" | "MOTORCYCLE";

export type FuelType =
  | "GASOLINE"
  | "DIESEL"
  | "ELECTRIC"
  | "HYBRID"
  | "UNLEADED_GASOLINE";

export type TransmissionType = "MANUAL" | "AUTOMATIC";

export type VehicleStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "MAINTENANCE"
  | "RESERVED"
  | "RENTED";

// Vehicle Feature
export interface VehicleFeature {
  feature: {
    name: string;
    icon: string;
    description: string;
  };
}

// Base Vehicle Interface
export interface Vehicle {
  id: string;
  type: VehicleType;
  name: string;
  brandId: string;
  modelId: string;
  seats: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  pricePerHour: number;
  pricePerDay: number;
  location: string;
  city: string;
  ward: string;
  latitude: number;
  longitude: number;
  description: string;
  terms: string[];
  status: VehicleStatus;
  totalTrips: number;
  averageRating: number;
  totalReviewIds: string[];
  images: string[];
  vehicleFeatures?: VehicleFeature[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Get Vehicle Response (without licensePlate)
export interface GetVehicleResponse extends Omit<Vehicle, "licensePlate"> {}

// Get Many Vehicles Request (with pagination)
export interface GetManyVehiclesRequest {
  id?: string;
  type?: VehicleType;
  name?: string;
  brandId?: string;
  modelId?: string;
  licensePlate?: string;
  seats?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  city?: string;
  ward?: string;
  status?: VehicleStatus;
  averageRating?: number;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Get Many Vehicles Response (with pagination)
export interface GetManyVehiclesResponse {
  vehicles: Omit<Vehicle, "vehicleFeatures" | "licensePlate">[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// Create Vehicle Request
export interface CreateVehicleRequest {
  type: VehicleType;
  name: string;
  brandId: string;
  modelId: string;
  licensePlate: string;
  seats: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  pricePerHour: number;
  pricePerDay: number;
  location: string;
  city: string;
  ward: string;
  latitude: number;
  longitude: number;
  description: string;
  terms: string[];
  status: VehicleStatus;
  images: string[];
  featureIds: string[];
}

// Update Vehicle Request
export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {
  id: string;
}

// Delete Vehicle Request
export interface DeleteVehicleRequest {
  id?: string;
  licensePlate?: string;
}

// Brand
export interface Brand {
  id: string;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GetAllBrandsResponse {
  brands: Omit<Brand, "createdAt" | "updatedAt">[];
}

export interface CreateBrandRequest {
  name: string;
}

export interface UpdateBrandRequest {
  name: string;
}

// Model
export interface Model {
  id: string;
  name: string;
  brandId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GetAllModelsRequest {
  brandId?: string;
}

export interface GetAllModelsResponse {
  models: Omit<Model, "createdAt" | "updatedAt">[];
}

export interface CreateModelRequest {
  name: string;
  brandId: string;
}

export interface UpdateModelRequest {
  name?: string;
  brandId?: string;
}

// Feature
export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GetAllFeaturesResponse {
  features: Omit<Feature, "createdAt" | "updatedAt">[];
}

export interface CreateFeatureRequest {
  name: string;
  description: string;
  icon: string;
}

export interface UpdateFeatureRequest {
  name?: string;
  description?: string;
  icon?: string;
}
