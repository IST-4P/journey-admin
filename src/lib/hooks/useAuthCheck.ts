import axios from "axios";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Hook để kiểm tra token định kỳ mỗi 5 phút
 * - Kiểm tra accessToken bằng cách gọi API refresh-token
 * - Nếu refresh-token thất bại (không có refreshToken), chuyển về login
 */
export function useAuthCheck() {
  const navigate = useNavigate();
  const intervalRef = useRef<number | null>(null);

  const checkToken = async () => {
    try {
      // Gọi API refresh token để kiểm tra
      // Nếu có refreshToken hợp lệ, server sẽ cấp lại accessToken mới
      // Sử dụng axios trực tiếp để tránh interceptor loop
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("[Auth] Token refreshed successfully");
    } catch (error: any) {
      // Nếu lỗi 401, nghĩa là không có refreshToken hoặc refreshToken hết hạn
      if (error.response?.status === 401) {
        console.log("[Auth] No valid refresh token, redirecting to login");
        navigate("/login", { replace: true });
      }
      // Các lỗi khác (network, server error) không làm gì
    }
  };

  useEffect(() => {
    // Kiểm tra ngay khi component mount
    checkToken();

    // Thiết lập interval kiểm tra mỗi 5 phút (300000ms)
    intervalRef.current = setInterval(() => {
      checkToken();
    }, 5 * 60 * 1000); // 5 phút

    // Cleanup khi component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
}
