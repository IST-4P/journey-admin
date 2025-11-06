import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { mockVehicles } from '../../lib/mockData';

export function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const isEdit = window.location.pathname.includes('/edit');

  const vehicleData = isNew ? null : mockVehicles.find((v) => v.id === Number(id));

  const [formData, setFormData] = useState({
    name: vehicleData?.name || '',
    type: vehicleData?.type || 'car',
    seats: vehicleData?.seats || 4,
    fuel: vehicleData?.fuel || 'Xăng',
    description: vehicleData?.description || '',
    location: vehicleData?.location || '',
    pricePerHour: vehicleData?.pricePerHour || 0,
    pricePerDay: vehicleData?.pricePerDay || 0,
    pricePerMonth: vehicleData?.pricePerMonth || 0,
    status: vehicleData?.status || 'available',
    images: vehicleData?.images || [],
    amenities: vehicleData?.amenities || [],
  });

  const availableAmenities = [
    'Bluetooth',
    'GPS',
    'Camera lùi',
    'Cảm biến lùi',
    'Định vị',
    'Bản đồ',
    'Khe cắm USB',
    'Túi khí',
  ];

  const handleSave = () => {
    // In a real app, save to backend
    navigate('/vehicles');
  };

  const toggleAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  const viewMode = !isNew && !isEdit;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew
              ? 'Tạo Phương Tiện Mới'
              : isEdit
              ? 'Chỉnh Sửa Phương Tiện'
              : 'Chi Tiết Phương Tiện'}
          </h2>
        </div>
        {viewMode && (
          <Button
            onClick={() => navigate(`/vehicles/${id}/edit`)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Tên Xe *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={viewMode}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Loại Xe *</Label>
                {viewMode ? (
                  <Input
                    value={formData.type === 'car' ? 'Ô tô' : 'Xe máy'}
                    disabled
                    className="mt-1"
                  />
                ) : (
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Ô tô</SelectItem>
                      <SelectItem value="motorbike">Xe máy</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {formData.type === 'car' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seats">Số Chỗ</Label>
                  <Input
                    id="seats"
                    type="number"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: Number(e.target.value) })}
                    disabled={viewMode}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="fuel">Nhiên Liệu</Label>
                  <Input
                    id="fuel"
                    value={formData.fuel}
                    onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                    disabled={viewMode}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="location">Vị Trí *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                disabled={viewMode}
                required
                className="mt-1"
                placeholder="Quận, Thành phố"
              />
            </div>

            <div>
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={viewMode}
                rows={4}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status & Pricing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng Thái</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode ? (
                <Badge
                  className={
                    formData.status === 'available'
                      ? 'bg-green-100 text-green-800'
                      : formData.status === 'rented'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {formData.status === 'available'
                    ? 'Có sẵn'
                    : formData.status === 'rented'
                    ? 'Đang thuê'
                    : 'Bảo trì'}
                </Badge>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="available"
                      checked={formData.status === 'available'}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as any })
                      }
                      className="text-[#007BFF]"
                    />
                    <span>Có sẵn</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="rented"
                      checked={formData.status === 'rented'}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as any })
                      }
                    />
                    <span>Đang thuê</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="maintenance"
                      checked={formData.status === 'maintenance'}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as any })
                      }
                    />
                    <span>Bảo trì</span>
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giá Thuê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pricePerHour">Giá/Giờ</Label>
                {viewMode ? (
                  <p className="mt-1">{formatCurrency(formData.pricePerHour)}</p>
                ) : (
                  <Input
                    id="pricePerHour"
                    type="number"
                    value={formData.pricePerHour}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerHour: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="pricePerDay">Giá/Ngày</Label>
                {viewMode ? (
                  <p className="mt-1">{formatCurrency(formData.pricePerDay)}</p>
                ) : (
                  <Input
                    id="pricePerDay"
                    type="number"
                    value={formData.pricePerDay}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerDay: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                )}
              </div>
              <div>
                <Label htmlFor="pricePerMonth">Giá/Tháng</Label>
                {viewMode ? (
                  <p className="mt-1">{formatCurrency(formData.pricePerMonth)}</p>
                ) : (
                  <Input
                    id="pricePerMonth"
                    type="number"
                    value={formData.pricePerMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerMonth: Number(e.target.value) })
                    }
                    className="mt-1"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Images */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Hình Ảnh</CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.length > 0 ? (
                  formData.images.map((img, index) => (
                    <div key={index} className="aspect-video bg-gray-200 rounded-lg"></div>
                  ))
                ) : (
                  <p className="text-gray-500">Chưa có hình ảnh</p>
                )}
              </div>
            ) : (
              <div>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Tải Lên Hình Ảnh (4-6 ảnh)
                </Button>
                <p className="text-sm text-gray-500 mt-2">Tải lên 4-6 hình ảnh của phương tiện</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Tiện Nghi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableAmenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onCheckedChange={() => toggleAmenity(amenity)}
                    disabled={viewMode}
                  />
                  <label htmlFor={amenity} className="text-sm">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {!viewMode && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/vehicles')}>
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
