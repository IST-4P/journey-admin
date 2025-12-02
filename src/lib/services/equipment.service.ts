import axiosInstance from "../axios";
import { RentalListResponse } from "../types/rental.types";

/**
 * Equipment/Device Service
 * Handles all equipment-related API calls
 */

// ==================== EQUIPMENT ENDPOINTS ====================

/**
 * Get list of equipment with pagination and filters
 */
export const getManyDevices = async (params?: any): Promise<any> => {
  return await axiosInstance.get("/device", { params });
};

/**
 * Get a single device by ID
 */
export const getDevice = async (id: string): Promise<any> => {
  return await axiosInstance.get(`/device/${id}`);
};

/**
 * Create a new device
 */
export const createDevice = async (data: any): Promise<any> => {
  return await axiosInstance.post("/device", data);
};

/**
 * Update an existing device
 */
export const updateDevice = async (id: string, data: any): Promise<any> => {
  return await axiosInstance.put(`/device/${id}`, data);
};

/**
 * Delete a device
 */
export const deleteDevice = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/device/${id}`);
};

// ==================== DEVICE CATEGORY ENDPOINTS ====================

/**
 * Get all device categories
 */
export const getAllCategories = async (): Promise<any> => {
  return await axiosInstance.get("/device-category");
};

// ==================== DEVICE FEATURE ENDPOINTS ====================

/**
 * Get all device features
 */
export const getAllFeatures = async (): Promise<any> => {
  return await axiosInstance.get("/device-feature");
};

/**
 * Create a new feature
 */
export const createFeature = async (data: {
  name: string;
  description: string;
  icon: string;
}): Promise<any> => {
  return await axiosInstance.post("/device-feature", data);
};

/**
 * Delete a feature
 */
export const deleteFeature = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/device-feature/${id}`);
};

// ==================== DEVICE BRAND ENDPOINTS ====================

/**
 * Get all device brands
 */
export const getAllBrands = async (): Promise<any> => {
  return await axiosInstance.get("/device-brand");
};

/**
 * Create a new brand
 */
export const createBrand = async (data: { name: string }): Promise<any> => {
  return await axiosInstance.post("/device-brand", data);
};

/**
 * Delete a brand
 */
export const deleteBrand = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/device-brand/${id}`);
};

// ==================== DEVICE MODEL ENDPOINTS ====================

/**
 * Get all device models (optionally filtered by brandId)
 */
export const getAllModels = async (params?: {
  brandId?: string;
}): Promise<any> => {
  return await axiosInstance.get("/device-model", { params });
};

/**
 * Create a new model
 */
export const createModel = async (data: {
  name: string;
  brandId: string;
}): Promise<any> => {
  return await axiosInstance.post("/device-model", data);
};

/**
 * Delete a model
 */
export const deleteModel = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/device-model/${id}`);
};

// ==================== COMBO ENDPOINTS ====================

/**
 * Get list of combos with pagination and filters
 */
export const getManyCombos = async (params?: any): Promise<any> => {
  return await axiosInstance.get("/combo", { params });
};

/**
 * Get a single combo by ID
 */
export const getCombo = async (id: string): Promise<any> => {
  return await axiosInstance.get(`/combo/${id}`);
};

/**
 * Create a new combo
 */
export const createCombo = async (data: any): Promise<any> => {
  return await axiosInstance.post("/combo", data);
};

/**
 * Update an existing combo
 */
export const updateCombo = async (id: string, data: any): Promise<any> => {
  return await axiosInstance.put(`/combo/${id}`, data);
};

/**
 * Delete a combo
 */
export const deleteCombo = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/combo/${id}`);
};

// ==================== RENTAL ENDPOINTS ====================

/**
 * Get list of rentals (equipment/device rentals) with pagination and filters
 */
export const getManyRentals = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
}): Promise<RentalListResponse> => {
  return await axiosInstance.get("/rental", { params });
};

/**
 * Get a single rental by ID (includes extension info)
 */
export const getRental = async (id: string): Promise<any> => {
  return await axiosInstance.get(`/rental/${id}`);
};

/**
 * Update rental information
 */
export const updateRental = async (id: string, data: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<any> => {
  return await axiosInstance.put(`/rental/${id}`, data);
};

/**
 * Get rental extensions by rental ID
 */
export const getRentalExtensions = async (rentalId: string): Promise<any> => {
  return await axiosInstance.get(`/rental-extension/${rentalId}`);
};

/**
 * Approve rental extension
 */
export const approveRentalExtension = async (extensionId: string): Promise<any> => {
  return await axiosInstance.put(`/rental-extension/approve/${extensionId}`);
};

/**
 * Reject rental extension
 */
export const rejectRentalExtension = async (extensionId: string, reason?: string): Promise<any> => {
  return await axiosInstance.put(`/rental-extension/reject/${extensionId}`, { reason });
};
