import axios from "axios";
import toast from "react-hot-toast";

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // Cho phép gửi và nhận cookies (accessToken, refreshToken)
  headers: {
    "Content-Type": "application/json",
  },
});

// Biến để tránh gọi refresh token nhiều lần
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Response interceptor để xử lý response
axiosInstance.interceptors.response.use(
  (response) => {
    // Nếu response có cấu trúc { data, message, statusCode }
    const { data, message, statusCode } = response.data;

    // Nếu thành công, trả về data
    if (statusCode >= 200 && statusCode < 300) {
      return data;
    }

    // Nếu có lỗi nhưng vẫn trả về response
    if (message) {
      toast.error(message);
    }

    return Promise.reject(response.data);
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đợi trong queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API refresh token
        await axiosInstance.post("/auth/refresh-token");
        processQueue();
        isRefreshing = false;
        // Retry request gốc
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(new Error("Token refresh failed"));
        isRefreshing = false;

        // Chỉ redirect về login nếu không phải từ auth init check
        // (để tránh redirect khi đang kiểm tra auth lần đầu)
        if (!originalRequest.skipAuthRedirect) {
          // Refresh token thất bại, chuyển về trang login
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");

          // Chuyển về trang login sau 1 giây
          setTimeout(() => {
            window.location.href = "/login";
          }, 1000);
        }

        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    if (error.response) {
      const { message, statusCode } = error.response.data || {};

      // Không hiển thị toast cho lỗi 401 (đã xử lý ở trên)
      if (error.response.status !== 401) {
        if (message) {
          toast.error(message);
        } else {
          toast.error(
            `Lỗi ${statusCode || error.response.status}: ${
              error.response.statusText
            }`
          );
        }
      }
    } else if (error.request) {
      toast.error("Không thể kết nối đến server");
    } else {
      toast.error(error.message || "Đã xảy ra lỗi");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
