import { Edit, Plus, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

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

interface VehicleFormDialogProps {
  mode?: 'create' | 'edit';
  vehicleData?: Partial<VehicleFormData>;
  trigger?: React.ReactNode;
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

export function VehicleFormDialog({ mode = 'create', vehicleData, trigger }: VehicleFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);
  const [termInput, setTermInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<string[]>(defaultFeatures);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  // Load vehicle data when in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && vehicleData) {
      setFormData({ ...initialFormData, ...vehicleData });
      setImageUrls(vehicleData.images || []);
      
      // Add custom features to available features list
      if (vehicleData.vehicleFeatures) {
        const customFeatures = vehicleData.vehicleFeatures.filter(
          (f) => !defaultFeatures.includes(f)
        );
        if (customFeatures.length > 0) {
          setAvailableFeatures([...defaultFeatures, ...customFeatures]);
        }
      }
    } else if (open && mode === 'create') {
      setFormData(initialFormData);
      setImageUrls([]);
      setAvailableFeatures(defaultFeatures);
    }
  }, [open, mode, vehicleData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      images: imageUrls,
    };
    console.log(`${mode === 'create' ? 'Create' : 'Update'} vehicle data:`, submitData);
    // Reset form and close dialog
    setFormData(initialFormData);
    setImageUrls([]);
    setTermInput('');
    setCustomFeatureInput('');
    setAvailableFeatures(defaultFeatures);
    setOpen(false);
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

  const defaultTrigger = mode === 'create' ? (
    <Button className="bg-[#007BFF] hover:bg-[#0056b3]">
      <Plus className="h-4 w-4 mr-2" />
      Thêm Phương Tiện
    </Button>
  ) : (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm Phương Tiện Mới' : 'Chỉnh Sửa Phương Tiện'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Điền đầy đủ thông tin phương tiện để thêm vào hệ thống'
              : 'Cập nhật thông tin phương tiện'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4>Thông Tin Cơ Bản</h4>
            
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
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4>Giá Thuê</h4>
            
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
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h4>Vị Trí</h4>
            
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
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h4>Mô Tả</h4>
            
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
          </div>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4>Tiện Nghi</h4>
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
          </div>

          {/* Terms */}
          <div className="space-y-4">
            <h4>Điều Khoản</h4>
            
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
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h4>Hình Ảnh</h4>
            
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
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h4>Trạng Thái</h4>
            
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
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
              {mode === 'create' ? 'Tạo Phương Tiện' : 'Cập Nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
