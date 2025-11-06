import { ArrowLeft, Plus, Save, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

interface VehicleFormData {
  type: 'CAR' | 'MOTORBIKE';
  name: string;
  brand: string;
  model: string;
  licensePlate: string;
  seats: number;
  fuelType: 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';
  transmission: 'AUTOMATIC' | 'MANUAL';
  pricePerHour: number;
  pricePerDay: number;
  location: string;
  city: string;
  ward: string;
  latitude: number;
  longitude: number;
  description: string;
  terms: string[];
  status: 'ACTIVE' | 'INACTIVE';
  images: string[];
  vehicleFeatures: string[];
}

const initialFormData: VehicleFormData = {
  type: 'CAR',
  name: '',
  brand: '',
  model: '',
  licensePlate: '',
  seats: 5,
  fuelType: 'GASOLINE',
  transmission: 'AUTOMATIC',
  pricePerHour: 0,
  pricePerDay: 0,
  location: '',
  city: '',
  ward: '',
  latitude: 0,
  longitude: 0,
  description: '',
  terms: [],
  status: 'ACTIVE',
  images: [],
  vehicleFeatures: [],
};

const defaultFeatures = [
  'Bluetooth',
  'Camera lùi',
  'Điều hòa',
  'Cửa sổ trời',
  'Cảm biến lùi',
  'Định vị GPS',
  'Túi khí',
  'ABS',
  'Cruise Control',
  'Cảm biến áp suất lốp',
];

export function VehicleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [termInput, setTermInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>(defaultFeatures);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // Load vehicle data when editing
  useEffect(() => {
    if (!isNew && id) {
      const vehicle = mockVehicles.find((v) => v.id === Number(id));
      if (vehicle) {
        setFormData({
          type: vehicle.type === 'car' ? 'CAR' : 'MOTORBIKE',
          name: vehicle.name,
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          licensePlate: vehicle.licensePlate || '',
          seats: vehicle.seats || 5,
          fuelType: 'GASOLINE',
          transmission: 'AUTOMATIC',
          pricePerHour: vehicle.pricePerHour || 0,
          pricePerDay: vehicle.pricePerDay,
          location: vehicle.location,
          city: vehicle.city || '',
          ward: vehicle.ward || '',
          latitude: vehicle.latitude || 0,
          longitude: vehicle.longitude || 0,
          description: vehicle.description || '',
          terms: [],
          status: vehicle.status === 'available' ? 'ACTIVE' : 'INACTIVE',
          images: vehicle.images || [],
          vehicleFeatures: vehicle.features || [],
        });
        setImageUrls(vehicle.images || []);
      }
    }
  }, [id, isNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      images: imageUrls,
    };
    console.log(`${isNew ? 'Create' : 'Update'} vehicle data:`, submitData);
    navigate('/vehicles');
  };

  const handleAddTerm = () => {
    if (termInput.trim() && !formData.terms.includes(termInput.trim())) {
      setFormData({
        ...formData,
        terms: [...formData.terms, termInput.trim()],
      });
      setTermInput('');
    }
  };

  const handleRemoveTerm = (term: string) => {
    setFormData({
      ...formData,
      terms: formData.terms.filter((t) => t !== term),
    });
  };

  const toggleFeature = (feature: string) => {
    setFormData({
      ...formData,
      vehicleFeatures: formData.vehicleFeatures.includes(feature)
        ? formData.vehicleFeatures.filter((f) => f !== feature)
        : [...formData.vehicleFeatures, feature],
    });
  };

  const handleAddCustomFeature = () => {
    if (customFeatureInput.trim() && !availableFeatures.includes(customFeatureInput.trim())) {
      const newFeature = customFeatureInput.trim();
      setAvailableFeatures([...availableFeatures, newFeature]);
      setFormData({
        ...formData,
        vehicleFeatures: [...formData.vehicleFeatures, newFeature],
      });
      setCustomFeatureInput('');
    }
  };

  const handleAddImage = () => {
    const url = prompt('Nhập URL hình ảnh:');
    if (url && url.trim()) {
      setImageUrls([...imageUrls, url.trim()]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? 'Thêm Phương Tiện Mới' : 'Chỉnh Sửa Phương Tiện'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại Phương Tiện *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'CAR' | 'MOTORBIKE') =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Ô tô</SelectItem>
                    <SelectItem value="MOTORBIKE">Xe máy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Tên Phương Tiện *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Toyota Vios 2023"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Hãng *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Toyota"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Mẫu *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Vios"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licensePlate">Biển Số *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="51A-12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seats">Số Chỗ Ngồi *</Label>
                <Input
                  id="seats"
                  type="number"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                  min="1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Loại Nhiên Liệu *</Label>
                <Select
                  value={formData.fuelType}
                  onValueChange={(value: VehicleFormData['fuelType']) =>
                    setFormData({ ...formData, fuelType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GASOLINE">Xăng</SelectItem>
                    <SelectItem value="DIESEL">Dầu Diesel</SelectItem>
                    <SelectItem value="ELECTRIC">Điện</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transmission">Hộp Số *</Label>
                <Select
                  value={formData.transmission}
                  onValueChange={(value: 'AUTOMATIC' | 'MANUAL') =>
                    setFormData({ ...formData, transmission: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTOMATIC">Tự động</SelectItem>
                    <SelectItem value="MANUAL">Số sàn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Giá Thuê</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Giá/Giờ (VNĐ) *</Label>
                <Input
                  id="pricePerHour"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerHour: parseInt(e.target.value) })
                  }
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Giá/Ngày (VNĐ) *</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerDay: parseInt(e.target.value) })
                  }
                  placeholder="800000"
                  min="0"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Vị Trí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Địa Chỉ *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="123 Nguyễn Văn A, Quận 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Thành Phố *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="TP.HCM"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ward">Phường/Xã *</Label>
                <Input
                  id="ward"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                  placeholder="Phường Bến Nghé"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="latitude">Vĩ Độ</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.0001"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                  placeholder="10.7769"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Kinh Độ</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.0001"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({ ...formData, longitude: parseFloat(e.target.value) })
                  }
                  placeholder="106.7009"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Mô Tả</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả Chi Tiết</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Xe mới, sạch sẽ, tiết kiệm nhiên liệu"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tiện Nghi</CardTitle>
              <div className="flex items-center gap-2">
                <Input
                  value={customFeatureInput}
                  onChange={(e) => setCustomFeatureInput(e.target.value)}
                  placeholder="Thêm tiện nghi..."
                  className="w-48"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomFeature())}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCustomFeature}
                  className="bg-[#007BFF] hover:bg-[#0056b3]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFeatures.map((feature) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Checkbox
                    id={feature}
                    checked={formData.vehicleFeatures.includes(feature)}
                    onCheckedChange={() => toggleFeature(feature)}
                  />
                  <Label htmlFor={feature} className="cursor-pointer">
                    {feature}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Điều Khoản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                placeholder="Nhập điều khoản..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTerm())}
              />
              <Button type="button" onClick={handleAddTerm}>
                Thêm
              </Button>
            </div>

            {formData.terms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.terms.map((term, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span>{term}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTerm(term)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hình Ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button type="button" onClick={handleAddImage} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Thêm URL Hình Ảnh
            </Button>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Vehicle ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Trạng Thái</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={formData.status}
              onValueChange={(value: 'ACTIVE' | 'INACTIVE') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
            Hủy
          </Button>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
            <Save className="h-4 w-4 mr-2" />
            {isNew ? 'Tạo Phương Tiện' : 'Cập Nhật'}
          </Button>
        </div>
      </form>
    </div>
  );
}
