import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { authService } from "../lib/services/auth.service";

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      await authService.login({ email, password });
      toast.success("Đăng nhập thành công!");
      onLogin();
    } catch (error) {
      // Lỗi đã được xử lý bởi axios interceptor
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl text-[#007BFF] mb-2">HacMieu Journey</h1>
            <p className="text-gray-600">Admin Dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@hacmieu.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Mật Khẩu</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-[#007BFF] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
