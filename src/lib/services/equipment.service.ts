import axiosInstance from "../axios";

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
