import axiosInstance from "../axios";
import type {
  Brand,
  CreateBrandRequest,
  CreateFeatureRequest,
  CreateModelRequest,
  CreateVehicleRequest,
  DeleteVehicleRequest,
  Feature,
  GetAllBrandsResponse,
  GetAllFeaturesResponse,
  GetAllModelsRequest,
  GetAllModelsResponse,
  GetManyVehiclesRequest,
  GetManyVehiclesResponse,
  GetVehicleResponse,
  Model,
  UpdateBrandRequest,
  UpdateFeatureRequest,
  UpdateModelRequest,
  UpdateVehicleRequest,
} from "../types/vehicle.types";

/**
 * Vehicle Service
 * Handles all vehicle-related API calls
 */

// ==================== VEHICLE ENDPOINTS ====================

/**
 * Get list of vehicles with pagination and filters
 */
export const getManyVehicles = async (
  params?: GetManyVehiclesRequest
): Promise<GetManyVehiclesResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get("/vehicle", { params });
};

/**
 * Get a single vehicle by ID
 */
export const getVehicle = async (id: string): Promise<GetVehicleResponse> => {
  // Axios interceptor đã trả về data từ {data, message, statusCode}
  return await axiosInstance.get(`/vehicle/${id}`);
};

/**
 * Create a new vehicle
 */
export const createVehicle = async (
  data: CreateVehicleRequest
): Promise<GetVehicleResponse> => {
  return await axiosInstance.post("/vehicle", data);
};

/**
 * Update an existing vehicle
 */
export const updateVehicle = async (
  id: string,
  data: UpdateVehicleRequest
): Promise<GetVehicleResponse> => {
  return await axiosInstance.put(`/vehicle/${id}`, data);
};

/**
 * Delete a vehicle
 */
export const deleteVehicle = async (
  params: DeleteVehicleRequest
): Promise<void> => {
  const { id } = params;
  await axiosInstance.delete(`/vehicle/${id}`);
};

// ==================== FEATURE ENDPOINTS ====================

/**
 * Get all vehicle features
 */
export const getAllFeatures = async (): Promise<GetAllFeaturesResponse> => {
  return await axiosInstance.get("/vehicle-feature");
};

/**
 * Get a single feature by ID
 */
export const getFeature = async (id: string): Promise<Feature> => {
  return await axiosInstance.get(`/vehicle-feature/${id}`);
};

/**
 * Create a new feature
 */
export const createFeature = async (
  data: CreateFeatureRequest
): Promise<Feature> => {
  return await axiosInstance.post("/vehicle-feature", data);
};

/**
 * Update an existing feature
 */
export const updateFeature = async (
  id: string,
  data: UpdateFeatureRequest
): Promise<Feature> => {
  return await axiosInstance.put(`/vehicle-feature/${id}`, data);
};

/**
 * Delete a feature
 */
export const deleteFeature = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/vehicle-feature/${id}`);
};

// ==================== BRAND ENDPOINTS ====================

/**
 * Get all vehicle brands
 */
export const getAllBrands = async (): Promise<GetAllBrandsResponse> => {
  return await axiosInstance.get("/vehicle-brand");
};

/**
 * Create a new brand
 */
export const createBrand = async (data: CreateBrandRequest): Promise<Brand> => {
  return await axiosInstance.post("/vehicle-brand", data);
};

/**
 * Update an existing brand
 */
export const updateBrand = async (
  id: string,
  data: UpdateBrandRequest
): Promise<Brand> => {
  return await axiosInstance.put(`/vehicle-brand/${id}`, data);
};

/**
 * Delete a brand
 */
export const deleteBrand = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/vehicle-brand/${id}`);
};

// ==================== MODEL ENDPOINTS ====================

/**
 * Get all vehicle models (optionally filtered by brandId)
 */
export const getAllModels = async (
  params?: GetAllModelsRequest
): Promise<GetAllModelsResponse> => {
  return await axiosInstance.get("/vehicle-model", { params });
};

/**
 * Create a new model
 */
export const createModel = async (data: CreateModelRequest): Promise<Model> => {
  return await axiosInstance.post("/vehicle-model", data);
};

/**
 * Update an existing model
 */
export const updateModel = async (
  id: string,
  data: UpdateModelRequest
): Promise<Model> => {
  return await axiosInstance.put(`/vehicle-model/${id}`, data);
};

/**
 * Delete a model
 */
export const deleteModel = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/vehicle-model/${id}`);
};
