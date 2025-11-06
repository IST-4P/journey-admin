import axios from "axios";
import { useEffect, useState } from "react";

/**
 * Hook để kiểm tra và khởi tạo authentication khi vào trang web
 * - Gọi API refresh-token để verify cookies (httpOnly)
 * - Nếu thành công, user được authenticate tự động
 * - Không check cookie từ JS vì httpOnly: true
 */
export function useAuthInit() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Gọi API refresh-token để kiểm tra
        // Backend sẽ tự check refreshToken từ cookie (httpOnly)
        console.log("[Auth Init] Checking authentication...");

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          {},
          {
            withCredentials: true, // Quan trọng: gửi cookies
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        // Kiểm tra response
        if (response.status === 200 || response.status === 201) {
          // Refresh thành công, user đã được authenticate
          console.log("[Auth Init] Authentication successful");
          setIsAuthenticated(true);
        } else {
          console.log(
            "[Auth Init] Unexpected response status:",
            response.status
          );
          setIsAuthenticated(false);
        }
      } catch (error: any) {
        // Không có refreshToken hoặc token không hợp lệ
        console.log(
          "[Auth Init] No valid refresh token",
          error.response?.status
        );
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, isChecking, setIsAuthenticated };
}
