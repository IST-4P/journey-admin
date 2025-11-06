import { ArrowLeft, Check, Save, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Textarea } from '../../components/ui/textarea';
import { mockUsers } from '../../lib/mockData';

export function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const isEdit = window.location.pathname.includes('/edit');

  const userData = isNew ? null : mockUsers.find((u) => u.id === Number(id));

  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    phone: userData?.phone || '',
    trustScore: userData?.trustScore || 50,
    licenseVerified: userData?.licenseVerified || false,
    addresses: userData?.addresses || [''],
    bankAccount: userData?.bankAccount || '',
    status: userData?.status || 'active',
  });

  const handleSave = () => {
    // In a real app, save to backend
    navigate('/users');
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [...formData.addresses, ''],
    });
  };

  const updateAddress = (index: number, value: string) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = value;
    setFormData({ ...formData, addresses: newAddresses });
  };

  const removeAddress = (index: number) => {
    const newAddresses = formData.addresses.filter((_, i) => i !== index);
    setFormData({ ...formData, addresses: newAddresses });
  };

  const viewMode = !isNew && !isEdit;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? 'Tạo Người Dùng Mới' : isEdit ? 'Chỉnh Sửa Người Dùng' : 'Chi Tiết Người Dùng'}
          </h2>
        </div>
        {viewMode && (
          <Button
            onClick={() => navigate(`/users/${id}/edit`)}
            className="bg-[#007BFF] hover:bg-[#0056b3]"
          >
            Chỉnh Sửa
          </Button>
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
              {viewMode ? (
                <div className="mt-2 h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-600">
                    {formData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="mt-2 flex items-center space-x-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-600">
                      {formData.name.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Tải Lên
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Họ Tên *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled
                  required
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Không thể chỉnh sửa thông tin cá nhân</p>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled
                  required
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Không thể chỉnh sửa thông tin cá nhân</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Số Điện Thoại *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled
                  required
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Không thể chỉnh sửa thông tin cá nhân</p>
              </div>
              <div>
                <Label htmlFor="bankAccount">Tài Khoản Ngân Hàng</Label>
                <Input
                  id="bankAccount"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  disabled
                  className="mt-1 bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">Không thể chỉnh sửa thông tin cá nhân</p>
              </div>
            </div>

            <div>
              <Label>Giấy Phép Lái Xe</Label>
              <div className="mt-2 space-y-3">
                {userData?.licenseImages && userData.licenseImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {userData.licenseImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`GPLX ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=GPLX';
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có hình ảnh GPLX</p>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="licenseVerified"
                    checked={formData.licenseVerified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, licenseVerified: checked as boolean })
                    }
                    disabled={viewMode}
                  />
                  <label htmlFor="licenseVerified" className="text-sm">
                    Đã Xác Thực
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label>Điểm Tín Nhiệm: {formData.trustScore}</Label>
              <Slider
                value={[formData.trustScore]}
                onValueChange={([value]) => setFormData({ ...formData, trustScore: value })}
                max={100}
                step={1}
                disabled={viewMode}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng Thái</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewMode ? (
              <Badge
                className={
                  formData.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : formData.status === 'suspended'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }
              >
                {formData.status === 'active'
                  ? 'Hoạt động'
                  : formData.status === 'suspended'
                  ? 'Bị khóa'
                  : 'Không hoạt động'}
              </Badge>
            ) : (
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="text-[#007BFF]"
                  />
                  <span>Hoạt động</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  />
                  <span>Không hoạt động</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="suspended"
                    checked={formData.status === 'suspended'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  />
                  <span>Bị khóa</span>
                </label>
              </div>
            )}

            {userData && (
              <div className="mt-4 text-sm text-gray-600">
                <p>Ngày đăng ký:</p>
                <p>{userData.registrationDate}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Addresses */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Địa Chỉ</CardTitle>
              {!viewMode && (
                <Button variant="outline" size="sm" onClick={addAddress}>
                  Thêm Địa Chỉ
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.addresses.map((address, index) => (
              <div key={index} className="flex items-center space-x-2">
                {viewMode ? (
                  <p className="flex-1">{address}</p>
                ) : (
                  <>
                    <Textarea
                      value={address}
                      onChange={(e) => updateAddress(index, e.target.value)}
                      placeholder="Nhập địa chỉ..."
                      className="flex-1"
                      rows={2}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAddress(index)}
                      disabled={formData.addresses.length === 1}
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {!viewMode && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/users')}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="bg-[#007BFF] hover:bg-[#0056b3]">
            <Save className="h-4 w-4 mr-2" />
            Lưu
          </Button>
        </div>
      )}
    </div>
  );
}
