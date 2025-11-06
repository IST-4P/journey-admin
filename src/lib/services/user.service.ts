import axiosInstance from "../axios";
import type {
  Address,
  BankAccount,
  DriverLicense,
  GetAllProfilesRequest,
  GetAllProfilesResponse,
  GetProfileResponse,
  UpdateAddressRequest,
  UpdateBankAccountRequest,
  UpdateDriverLicenseRequest,
  UpdateProfileRequest,
  VerifyDriverLicenseRequest,
} from "../types/user.types";

export const userService = {
  // ============ PROFILE ============

  /**
   * Lấy danh sách tất cả profiles với phân trang và filter
   * GET /api/user/profiles
   */
  getAllProfiles: async (
    params?: GetAllProfilesRequest
  ): Promise<GetAllProfilesResponse> => {
    // Axios interceptor đã trả về data từ {data, message, statusCode}
    return await axiosInstance.get("/user/profiles", { params });
  },

  /**
   * Lấy thông tin profile của một user
   * GET /api/user/profile/{userId}
   */
  getProfile: async (userId: string): Promise<GetProfileResponse> => {
    // Axios interceptor đã trả về data từ {data, message, statusCode}
    return await axiosInstance.get(`/user/profile/${userId}`);
  },

  /**
   * Cập nhật thông tin profile
   * PUT /api/user/profile
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<GetProfileResponse> => {
    return await axiosInstance.put("/user/profile", data);
  },

  // ============ DRIVER LICENSE ============

  /**
   * Lấy thông tin giấy phép lái xe của user
   * GET /api/user/driver-license/{userId}
   */
  getDriverLicense: async (userId: string): Promise<DriverLicense> => {
    return await axiosInstance.get(`/user/driver-license/${userId}`);
  },

  /**
   * Cập nhật thông tin giấy phép lái xe
   * PUT /api/user/driver-license
   */
  updateDriverLicense: async (
    data: UpdateDriverLicenseRequest
  ): Promise<DriverLicense> => {
    return await axiosInstance.put("/user/driver-license", data);
  },

  /**
   * Xác minh giấy phép lái xe (Admin)
   * PUT /api/user/driver-license/verify
   */
  verifyDriverLicense: async (
    data: VerifyDriverLicenseRequest
  ): Promise<DriverLicense> => {
    return await axiosInstance.put("/user/driver-license/verify", data);
  },

  // ============ BANK ACCOUNT ============

  /**
   * Lấy thông tin tài khoản ngân hàng của user
   * GET /api/user/bank-account/{userId}
   */
  getBankAccount: async (userId: string): Promise<BankAccount> => {
    return await axiosInstance.get(`/user/bank-account/${userId}`);
  },

  /**
   * Cập nhật thông tin tài khoản ngân hàng
   * PUT /api/user/bank-account/{userId}
   */
  updateBankAccount: async (
    userId: string,
    data: UpdateBankAccountRequest
  ): Promise<BankAccount> => {
    return await axiosInstance.put(`/user/bank-account/${userId}`, data);
  },

  // ============ ADDRESS ============

  /**
   * Lấy danh sách địa chỉ của user hiện tại
   * GET /api/user/address
   */
  getAddresses: async (): Promise<Address[]> => {
    return await axiosInstance.get("/user/address");
  },

  /**
   * Cập nhật địa chỉ
   * PUT /api/user/address
   */
  updateAddress: async (data: UpdateAddressRequest): Promise<Address> => {
    return await axiosInstance.put("/user/address", data);
  },

  /**
   * Xóa địa chỉ
   * DELETE /api/user/address
   */
  deleteAddress: async (addressId: string): Promise<void> => {
    await axiosInstance.delete("/user/address", {
      params: { addressId },
    });
  },
};
