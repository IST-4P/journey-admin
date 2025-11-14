import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { authService } from "../lib/services/auth.service";

type Step = "email" | "reset";

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Bước 1: Gửi OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    setIsLoading(true);
    try {
      await authService.sendOTP({
        email,
        type: "FORGOT_PASSWORD",
      });
      toast.success("Mã OTP đã được gửi đến email của bạn!");
      setStep("reset");
    } catch (error) {
      console.error("Send OTP error:", error);
      // Lỗi đã được xử lý bởi axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  // Bước 2: Reset mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Vui lòng nhập mã OTP !");
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      toast.error("Vui lòng nhập đầy đủ mật khẩu!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Mật khẩu phải có ít nhất 4 ký tự!");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword({
        email,
        code: otp,
        newPassword,
        confirmNewPassword,
      });
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      // Redirect về trang login sau 1.5s
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Reset password error:", error);
      // Lỗi đã được xử lý bởi axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Quay lại đăng nhập
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Quên mật khẩu</h1>
            <p className="text-gray-600 mt-1">
              {step === "email"
                ? "Nhập email để nhận mã OTP"
                : "Nhập mã OTP và mật khẩu mới"}
            </p>
          </div>

          {/* Step 1: Send OTP */}
          {step === "email" && (
            <form onSubmit={handleSendOTP} className="space-y-6">
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

              <Button
                type="submit"
                className="w-full bg-[#007BFF] hover:bg-[#0056b3]"
                disabled={isLoading}
              >
                {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
              </Button>
            </form>
          )}

          {/* Step 2: Reset Password */}
          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <Label htmlFor="email-display">Email</Label>
                <Input
                  id="email-display"
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>

              <div>
                <Label htmlFor="otp">Mã OTP (6 số)</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Nhập mã OTP 6 số"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  pattern="[0-9]*"
                  inputMode="numeric"
                  className="mt-1 text-center text-lg tracking-widest"
                  required
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  Kiểm tra email để lấy mã OTP
                </p>
              </div>

              <div>
                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                <div className="relative mt-1">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              <div>
                <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmNewPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                  }}
                  disabled={isLoading}
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#007BFF] hover:bg-[#0056b3]"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
