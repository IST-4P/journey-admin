import { ReactNode } from "react";
import { useAuthCheck } from "../../lib/hooks/useAuthCheck";

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Component wrapper để kiểm tra authentication định kỳ
 * Phải được đặt bên trong BrowserRouter
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Kiểm tra token định kỳ mỗi 5 phút
  useAuthCheck();

  return <>{children}</>;
}
