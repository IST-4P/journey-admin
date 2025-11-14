import { ArrowLeft, Check, Edit2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Slider } from "../../components/ui/slider";
import { Textarea } from "../../components/ui/textarea";
import { userService } from "../../lib/services/user.service";
import type {
  BankAccount,
  DriverLicense,
  Gender,
  Profile,
} from "../../lib/types/user.types";

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [driverLicense, setDriverLicense] = useState<DriverLicense | null>(
    null
  );
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    phone: "",
    bio: "",
    gender: "OTHER" as Gender,
    avatarUrl: "",
  });

  const [formData, setFormData] = useState({
    licenseVerified: false,
    rejectedReason: "",
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchUserData();
    }
  }, [id, isNew]);

  useEffect(() => {
    if (profile) {
      setEditFormData({
        fullName: profile.fullName,
        phone: profile.phone,
        bio: profile.bio,
        gender: profile.gender,
        avatarUrl: profile.avatarUrl,
      });
    }
  }, [profile]);

  const fetchUserData = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const [profileData, licenseData, bankData] = await Promise.allSettled([
        userService.getProfile(id),
        userService.getDriverLicense(id).catch(() => null),
        userService.getBankAccount(id).catch(() => null),
      ]);

      if (profileData.status === "fulfilled") {
        setProfile(profileData.value);
      }

      if (licenseData.status === "fulfilled" && licenseData.value) {
        setDriverLicense(licenseData.value);
        setFormData({
          licenseVerified: licenseData.value.isVerified,
          rejectedReason: licenseData.value.rejectedReason || "",
        });
      }

      if (bankData.status === "fulfilled" && bankData.value) {
        setBankAccount(bankData.value);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyLicense = async (isVerified: boolean) => {
    if (!id) return;

    try {
      await userService.verifyDriverLicense({
        userId: id,
        isVerified,
        rejectedReason: isVerified ? undefined : formData.rejectedReason,
      });

      toast.success(isVerified ? "Đã xác thực GPLX" : "Đã từ chối GPLX");
      fetchUserData();
    } catch (error) {
      console.error("Error verifying license:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!id) return;

    try {
      await userService.updateProfile({
        userId: id,
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        bio: editFormData.bio,
        gender: editFormData.gender,
        avatarUrl: editFormData.avatarUrl,
      });

      toast.success("Cập nhật thông tin thành công");
      setIsEditing(false);
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Cập nhật thông tin thất bại");
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditFormData({
        fullName: profile.fullName,
        phone: profile.phone,
        bio: profile.bio,
        gender: profile.gender,
        avatarUrl: profile.avatarUrl,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!profile && !isNew) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Không tìm thấy người dùng</p>
          <Button onClick={() => navigate("/users")} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? "Tạo Người Dùng Mới" : "Chi Tiết Người Dùng"}
          </h2>
        </div>
        {!isNew && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex items-center"
                >
                  <X className="h-4 w-4 mr-1" />
                  Hủy
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  className="bg-[#007BFF] hover:bg-[#0056b3] flex items-center"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Lưu
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#007BFF] hover:bg-[#0056b3] flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-1" />
                Chỉnh Sửa
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="avatar">Avatar</Label>
              <div className="mt-2 flex items-center space-x-4">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-600">
                      {profile?.fullName.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Họ Tên</Label>
                <Input
                  id="name"
                  value={isEditing ? editFormData.fullName : profile?.fullName || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, fullName: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? "bg-gray-50" : ""}`}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Số Điện Thoại</Label>
                <Input
                  id="phone"
                  value={isEditing ? editFormData.phone : profile?.phone || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className={`mt-1 ${!isEditing ? "bg-gray-50" : ""}`}
                />
              </div>
              <div>
                <Label htmlFor="role">Vai Trò</Label>
                <Input
                  id="role"
                  value={profile?.role || ""}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Giới Tính</Label>
                {isEditing ? (
                  <Select
                    value={editFormData.gender}
                    onValueChange={(value: Gender) =>
                      setEditFormData({ ...editFormData, gender: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Nam</SelectItem>
                      <SelectItem value="FEMALE">Nữ</SelectItem>
                      <SelectItem value="OTHER">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id="gender"
                    value={
                      profile?.gender === "MALE"
                        ? "Nam"
                        : profile?.gender === "FEMALE"
                        ? "Nữ"
                        : "Khác"
                    }
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="birthDate">Ngày Sinh</Label>
                <Input
                  id="birthDate"
                  value={
                    profile?.birthDate
                      ? new Date(profile.birthDate).toLocaleDateString("vi-VN")
                      : ""
                  }
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Tiểu Sử</Label>
              <Textarea
                id="bio"
                value={isEditing ? editFormData.bio : profile?.bio || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, bio: e.target.value })
                }
                disabled={!isEditing}
                className={`mt-1 ${!isEditing ? "bg-gray-50" : ""}`}
                rows={3}
              />
            </div>

            <div>
              <Label>Điểm Tín Nhiệm: {profile?.creditScore || 0}</Label>
              <Slider
                value={[profile?.creditScore || 0]}
                max={100}
                step={1}
                disabled
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* License Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Giấy Phép Lái Xe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {driverLicense ? (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {driverLicense.frontImageUrl && (
                      <img
                        src={driverLicense.frontImageUrl}
                        alt="GPLX mặt trước"
                        className="w-full h-24 object-cover rounded border"
                      />
                    )}
                    {driverLicense.backImageUrl && (
                      <img
                        src={driverLicense.backImageUrl}
                        alt="GPLX mặt sau"
                        className="w-full h-24 object-cover rounded border"
                      />
                    )}
                    {driverLicense.selfieImageUrl && (
                      <img
                        src={driverLicense.selfieImageUrl}
                        alt="Selfie"
                        className="w-full h-24 object-cover rounded border"
                      />
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Số GPLX:</span>
                      <p className="font-medium">
                        {driverLicense.licenseNumber}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Hạng:</span>
                      <p className="font-medium">
                        {driverLicense.licenseClass}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ngày cấp:</span>
                      <p className="font-medium">
                        {new Date(driverLicense.issueDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Ngày hết hạn:</span>
                      <p className="font-medium">
                        {new Date(driverLicense.expiryDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="licenseVerified"
                        checked={formData.licenseVerified}
                        onCheckedChange={(checked: boolean) =>
                          setFormData({ ...formData, licenseVerified: checked })
                        }
                      />
                      <label htmlFor="licenseVerified" className="text-sm">
                        Đã Xác Thực
                      </label>
                    </div>

                    {!formData.licenseVerified && (
                      <Textarea
                        placeholder="Lý do từ chối (nếu có)..."
                        value={formData.rejectedReason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rejectedReason: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    )}

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleVerifyLicense(true)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Xác Thực
                      </Button>
                      <Button
                        onClick={() => handleVerifyLicense(false)}
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Từ Chối
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Chưa có thông tin GPLX</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tài Khoản Ngân Hàng</CardTitle>
            </CardHeader>
            <CardContent>
              {bankAccount ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Ngân hàng:</span>
                    <p className="font-medium">{bankAccount.bankName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Số tài khoản:</span>
                    <p className="font-medium">{bankAccount.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Chủ tài khoản:</span>
                    <p className="font-medium">{bankAccount.accountHolder}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Chưa có thông tin tài khoản
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
