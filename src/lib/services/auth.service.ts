import axiosInstance from "../axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  // Backend tự động set cookie accessToken và refreshToken
  // Data có thể chứa thông tin user nếu cần
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role?: string;
  };
}

export const authService = {
  /**
   * Đăng nhập
   * POST /auth/login
   * Backend sẽ tự động set cookie: accessToken và refreshToken
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Axios interceptor đã trả về data từ {data, message, statusCode}
    return await axiosInstance.post("/auth/login", data);
  },

  /**
   * Đăng xuất
   * POST /auth/logout
   * Backend sẽ xóa cookies
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

  /**
   * Refresh token
   * POST /auth/refresh-token
   * Backend sẽ cấp lại accessToken mới qua cookie
   */
  refreshToken: async (): Promise<void> => {
    await axiosInstance.post("/auth/refresh-token");
  },

  /**
   * Gửi OTP
   * POST /auth/otp
   */
  sendOTP: async (data: { email: string; type: string }): Promise<void> => {
    await axiosInstance.post("/auth/otp", data);
  },

  /**
   * Quên mật khẩu
   * POST /auth/forgot-password
   */
  forgotPassword: async (data: {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<void> => {
    await axiosInstance.post("/auth/forgot-password", data);
  },
};
