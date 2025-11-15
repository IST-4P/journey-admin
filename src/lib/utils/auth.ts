import axios from '../axios';

export async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await axios.post('/auth/refresh', {}, {
      withCredentials: true,
    });

    if (response.data?.data?.accessToken) {
      const newToken = response.data.data.accessToken;
      localStorage.setItem('accessToken', newToken);
      
      // Dispatch custom event để các component khác cập nhật
      window.dispatchEvent(
        new CustomEvent('accessTokenChanged', { detail: { token: newToken } })
      );
      
      return true;
    }

    // Check if cookie-based auth
    if (response.status === 200) {
      localStorage.setItem('cookieAuth', 'true');
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'cookieAuth',
          newValue: 'true',
          storageArea: localStorage,
        })
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Auth] Failed to refresh token:', error);
    return false;
  }
}

export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

export function clearAccessToken(): void {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('cookieAuth');
  window.dispatchEvent(
    new CustomEvent('accessTokenChanged', { detail: { token: null } })
  );
}

/**
 * Decode JWT token to get user info
 */
export function decodeToken(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    console.log('[Auth] Decoded token payload:', payload);
    return payload;
  } catch (error) {
    console.error('[Auth] Failed to decode token:', error);
    return null;
  }
}

/**
 * Get current logged-in user ID from token
 */
export function getCurrentUserId(): string | null {
  const token = getStoredAccessToken();
  if (!token) {
    console.log('[Auth] No access token found');
    return null;
  }
  
  const payload = decodeToken(token);
  if (!payload) {
    console.log('[Auth] Failed to decode token');
    return null;
  }
  
  console.log('[Auth] Looking for userId in payload fields:', {
    id: payload?.id,
    userId: payload?.userId,
    sub: payload?.sub,
    user_id: payload?.user_id,
    adminId: payload?.adminId,
  });
  
  // Token payload might have 'id', 'userId', 'sub' (standard JWT subject), or other fields
  return payload?.id || payload?.userId || payload?.sub || payload?.user_id || payload?.adminId || null;
}
