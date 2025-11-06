/**
 * Kiểm tra xem có cookie với tên cụ thể không
 * @param name - Tên của cookie cần kiểm tra
 * @returns true nếu cookie tồn tại, false nếu không
 *
 * ⚠️ DEPRECATED: Hàm này không hoạt động với httpOnly cookies (như accessToken, refreshToken).
 * httpOnly cookies không thể đọc được từ JavaScript (document.cookie) vì lý do bảo mật.
 * Thay vào đó, hãy gọi API để backend kiểm tra cookies.
 */
export function hasCookie(name: string): boolean {
  const cookies = document.cookie.split(";");
  const found = cookies.some((cookie) => {
    const [cookieName] = cookie.trim().split("=");
    return cookieName === name;
  });

  console.warn(`[Cookie Check] Đang kiểm tra ${name}: ${found}`);
  console.warn("[All Cookies]", document.cookie);
  console.warn(
    "⚠️ Lưu ý: httpOnly cookies (accessToken, refreshToken) không thể đọc được từ document.cookie"
  );

  return found;
}

/**
 * Kiểm tra xem có cả accessToken và refreshToken không
 * @returns true nếu có cả 2 tokens
 *
 * ⚠️ DEPRECATED: Hàm này KHÔNG hoạt động vì accessToken và refreshToken là httpOnly cookies.
 * Luôn trả về false vì không thể đọc httpOnly cookies từ JavaScript.
 * Thay vào đó, hãy gọi API /auth/refresh-token để backend kiểm tra cookies.
 */
export function hasAuthCookies(): boolean {
  console.warn(
    "⚠️ hasAuthCookies() đã lỗi thời - không thể kiểm tra httpOnly cookies. Hãy dùng API thay thế."
  );
  // Kiểm tra xem có cả accessToken và refreshToken trong cookies không
  const hasAccessToken = hasCookie("accessToken");
  const hasRefreshToken = hasCookie("refreshToken");

  return hasAccessToken && hasRefreshToken;
}

/**
 * Kiểm tra xem có refreshToken không
 * @returns true nếu có refreshToken
 *
 * ⚠️ DEPRECATED: Hàm này KHÔNG hoạt động vì refreshToken là httpOnly cookie.
 * Luôn trả về false vì không thể đọc httpOnly cookies từ JavaScript.
 * Thay vào đó, hãy gọi API /auth/refresh-token để backend kiểm tra cookies.
 */
export function hasRefreshToken(): boolean {
  console.warn(
    "⚠️ hasRefreshToken() đã lỗi thời - không thể kiểm tra httpOnly cookies. Hãy dùng API thay thế."
  );
  return hasCookie("refreshToken");
}
