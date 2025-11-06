import { ArrowLeft, Minus, Plus, Save, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
import { mockCombos, mockEquipment, type ComboDevice } from '../../lib/mockData';

interface ComboFormData {
  name: string;
  price: number;
  description: string;
  images: string[];
  devices: ComboDevice[];
}

const initialFormData: ComboFormData = {
  name: '',
  price: 0,
  description: '',
  images: [],
  devices: [],
};

export function ComboFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<ComboFormData>(initialFormData);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Load combo data when editing
  useEffect(() => {
    if (!isNew && id) {
      const combo = mockCombos.find((c) => c.id === Number(id));
      if (combo) {
        setFormData({
          name: combo.name,
          price: combo.price,
          description: combo.description || '',
          images: combo.images || [],
          devices: combo.devices,
        });
        setImageUrls(combo.images || []);
      }
    }
  }, [id, isNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      images: imageUrls,
    };
    console.log(`${isNew ? 'Create' : 'Update'} combo data:`, submitData);
    navigate('/equipment');
  };

  const handleAddDevice = () => {
    if (mockEquipment.length === 0) return;
    
    const newDevice: ComboDevice = {
      id: Date.now(),
      deviceId: mockEquipment[0].id,
      deviceName: mockEquipment[0].name,
      quantity: 1,
    };
    
    setFormData({
      ...formData,
      devices: [...formData.devices, newDevice],
    });
  };

  const handleRemoveDevice = (index: number) => {
    setFormData({
      ...formData,
      devices: formData.devices.filter((_, i) => i !== index),
    });
  };

  const handleUpdateDevice = (index: number, field: 'deviceId' | 'quantity', value: number) => {
    const newDevices = [...formData.devices];
    
    if (field === 'deviceId') {
      const equipment = mockEquipment.find((e) => e.id === value);
      if (equipment) {
        newDevices[index] = {
          ...newDevices[index],
          deviceId: value,
          deviceName: equipment.name,
        };
      }
    } else {
      newDevices[index] = {
        ...newDevices[index],
        quantity: value,
      };
    }
    
    setFormData({ ...formData, devices: newDevices });
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
          <Button variant="ghost" onClick={() => navigate('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? 'Thêm Combo Mới' : 'Chỉnh Sửa Combo'}
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
                <Label htmlFor="name">Tên Combo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Combo Camping Cơ Bản"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá/Ngày (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  placeholder="500000"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về combo"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Thiết Bị Trong Combo</CardTitle>
              <Button type="button" onClick={handleAddDevice} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Thiết Bị
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.devices.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Chưa có thiết bị nào. Nhấn "Thêm Thiết Bị" để bắt đầu.
              </p>
            ) : (
              formData.devices.map((device, index) => (
                <div key={device.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Thiết Bị</Label>
                      <Select
                        value={String(device.deviceId)}
                        onValueChange={(value) =>
                          handleUpdateDevice(index, 'deviceId', Number(value))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mockEquipment.map((equipment) => (
                            <SelectItem key={equipment.id} value={String(equipment.id)}>
                              {equipment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Số Lượng</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateDevice(
                              index,
                              'quantity',
                              Math.max(1, device.quantity - 1)
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={device.quantity}
                          onChange={(e) =>
                            handleUpdateDevice(index, 'quantity', parseInt(e.target.value) || 1)
                          }
                          min="1"
                          className="w-20 text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateDevice(index, 'quantity', device.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDevice(index)}
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))
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
                      alt={`Combo ${index + 1}`}
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

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/equipment')}>
            Hủy
          </Button>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
            <Save className="h-4 w-4 mr-2" />
            {isNew ? 'Tạo Combo' : 'Cập Nhật'}
          </Button>
        </div>
      </form>
    </div>
  );
}
