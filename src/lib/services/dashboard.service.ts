import axiosInstance from "../axios";

export interface DashboardStats {
  userCount: number;
  bookingOngoing: number;
  extensionPending: number;
  checkOutPending: number;
  vehicleActive: number;
  refundPending: number;
  deviceAvailable: number;
  comboActive: number;
  rentalActive: number;
  blogCount: number;
}

export interface DashboardResponse {
  data: DashboardStats;
  message: string;
  statusCode: number;
}

export const dashboardService = {
  /**
   * Lấy thống kê dashboard
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await axiosInstance.get<DashboardResponse>(
      "/system/dashboard"
    );
    return response as unknown as DashboardStats;
  },
};
