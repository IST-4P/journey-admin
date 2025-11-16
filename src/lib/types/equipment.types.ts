/**
 * Equipment/Device Types
 */

export interface Device {
  id: string;
  name: string;
  price: number;
  description: string;
  status: string;
  quantity?: number;
  information: string[];
  images?: string[];
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeviceListResponse {
  data: {
    devices: Device[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}

export interface Combo {
  id: string;
  name: string;
  price: number;
  description: string;
  images?: string[];
  deviceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ComboListResponse {
  data: {
    combos: Combo[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message: string;
  statusCode: number;
}
