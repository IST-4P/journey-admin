// API Base URL - adjust this to your backend URL
const API_BASE_URL = import.meta.env.VITE_API_ADMIN_URL || 'https://journey-admin.hacmieu.xyz/api';

// Debug: Log the API URL being used
console.log('🔧 API Base URL:', API_BASE_URL);
console.log('🔧 VITE_API_ADMIN_URL:', import.meta.env.VITE_API_ADMIN_URL);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    // Ensure baseUrl ends with / to avoid double slashes
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Remove leading slash from endpoint to avoid double slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    console.log('🌐 Making request to:', url);
    const token = localStorage.getItem('authToken');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: 'cors', // Enable CORS
        credentials: 'include', // Include cookies if needed
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `Lỗi ${response.status}`;
        throw {
          message: errorMessage,
          status: response.status,
        } as ApiError;
      }

      return await response.json();
    } catch (error) {
      // Check if it's already our formatted error
      if ((error as ApiError).status !== undefined) {
        throw error;
      }
      
      // Network or CORS error
      console.error('API Error:', error);
      throw {
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Server có đang chạy?\n2. URL API có đúng không?\n3. CORS có được cấu hình?',
        status: 0,
      } as ApiError;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Vehicle API methods
  async getVehicles(params?: {
    limit?: number;
    page?: number;
    search?: string;
    type?: string;
    status?: string;
    transmission?: string;
    fuelType?: string;
    seats?: number;
    city?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<VehicleListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type && params.type !== 'all') queryParams.append('type', params.type);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.transmission && params.transmission !== 'all') queryParams.append('transmission', params.transmission);
    if (params?.fuelType && params.fuelType !== 'all') queryParams.append('fuelType', params.fuelType);
    if (params?.seats) queryParams.append('seats', params.seats.toString());
    if (params?.city && params.city !== 'all') queryParams.append('city', params.city);
    if (params?.priceMin) queryParams.append('priceMin', params.priceMin.toString());
    if (params?.priceMax) queryParams.append('priceMax', params.priceMax.toString());

    const queryString = queryParams.toString();
    const endpoint = `/vehicle${queryString ? `?${queryString}` : ''}`;
    
    return await this.request<VehicleListResponse>(endpoint);
  }

  async getVehicleById(id: string): Promise<VehicleDetailResponse> {
    return await this.request<VehicleDetailResponse>(`/vehicle/${id}`);
  }

  async createVehicle(vehicleData: CreateVehicleRequest): Promise<VehicleDetailResponse> {
    return await this.request<VehicleDetailResponse>('/vehicle', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(id: string, vehicleData: UpdateVehicleRequest): Promise<VehicleDetailResponse> {
    return await this.request<VehicleDetailResponse>(`/vehicle/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(id: string): Promise<void> {
    await this.request(`/vehicle/${id}`, {
      method: 'DELETE',
    });
  }
}

// Types for Vehicle API
export interface Vehicle {
  id: string;
  type: string;
  name: string;
  brandId: string;
  modelId: string;
  seats: number;
  fuelType: string;
  transmission: string;
  pricePerHour: number;
  pricePerDay: number;
  location: string;
  city: string;
  ward: string;
  latitude: number;
  longitude: number;
  description: string;
  terms: string[];
  status: string;
  totalTrips: number;
  averageRating: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VehicleListResponse {
  data: {
    vehicles: Vehicle[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}

export interface VehicleDetailResponse {
  data: Vehicle;
  message: string;
  statusCode: number;
}

export interface CreateVehicleRequest {
  type: string;
  name: string;
  brandId: string;
  modelId: string;
  seats: number;
  fuelType: string;
  transmission: string;
  pricePerHour: number;
  pricePerDay: number;
  location: string;
  city: string;
  ward: string;
  latitude: number;
  longitude: number;
  description: string;
  terms: string[];
  status: string;
  images: string[];
}

export interface UpdateVehicleRequest extends Partial<CreateVehicleRequest> {}

export const apiService = new ApiService(API_BASE_URL);
