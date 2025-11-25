import { ArrowLeft, Minus, Plus, Save, Upload, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { getCombo, createCombo, updateCombo, getManyDevices } from '../../lib/services/equipment.service';
import * as mediaService from '../../lib/services/media.service';
import { toast } from 'sonner';

interface DeviceItem {
  deviceId: string;
  quantity: number;
}

interface ComboFormData {
  name: string;
  price: number;
  description: string;
  images: string[];
  deviceItems: DeviceItem[];
}

interface Device {
  id: string;
  name: string;
  price: number;
  status: string;
}

const initialFormData: ComboFormData = {
  name: '',
  price: 0,
  description: '',
  images: [],
  deviceItems: [],
};

export function ComboFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<ComboFormData>(initialFormData);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load available devices
  useEffect(() => {
    fetchDevices();
  }, []);

  // Load combo data when editing
  useEffect(() => {
    if (!isNew && id) {
      fetchCombo();
    }
  }, [id, isNew]);

  const fetchDevices = async () => {
    try {
      const response = await getManyDevices({ limit: 1000 }); // Get all devices
      setDevices(response.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Không thể tải danh sách thiết bị');
    }
  };

  const fetchCombo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getCombo(id);
      console.log('Combo form response:', response);
      const combo = response;
      setFormData({
        name: combo.name || '',
        price: combo.price || 0,
        description: combo.description || '',
        images: combo.images || [],
        deviceItems: combo.devices?.map((d: any) => ({
          deviceId: d.deviceId,
          quantity: d.quantity
        })) || [],
      });
      setImageUrls(combo.images || []);
    } catch (error) {
      console.error('Error fetching combo:', error);
      toast.error('Không thể tải thông tin combo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate deviceItems
    if (formData.deviceItems.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 thiết bị vào combo');
      return;
    }

    setLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        images: imageUrls,
        deviceItems: formData.deviceItems,
      };

      console.log('Submitting combo data:', submitData);

      if (isNew) {
        console.log('POST /combo - Creating new combo');
        await createCombo(submitData);
        toast.success('Tạo combo thành công');
      } else {
        console.log(`PUT /combo/${id} - Updating combo`);
        await updateCombo(id!, submitData);
        toast.success('Cập nhật combo thành công');
      }
      navigate('/equipment');
    } catch (error) {
      console.error('Error saving combo:', error);
      toast.error('Không thể lưu combo');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);

    try {
      // Upload multiple files
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} không phải là file ảnh`);
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} vượt quá 5MB`);
        }

        // Upload and get URL
        const url = await mediaService.uploadImage(file);
        return url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImageUrls([...imageUrls, ...uploadedUrls]);
      toast.success(`Đã upload ${uploadedUrls.length} ảnh thành công`);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Không thể upload ảnh');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleAddDeviceItem = () => {
    setFormData({
      ...formData,
      deviceItems: [...formData.deviceItems, { deviceId: '', quantity: 1 }]
    });
  };

  const handleRemoveDeviceItem = (index: number) => {
    setFormData({
      ...formData,
      deviceItems: formData.deviceItems.filter((_, i) => i !== index)
    });
  };

  const handleDeviceItemChange = (index: number, field: 'deviceId' | 'quantity', value: string | number) => {
    const newDeviceItems = [...formData.deviceItems];
    if (field === 'deviceId') {
      newDeviceItems[index].deviceId = value as string;
    } else {
      newDeviceItems[index].quantity = value as number;
    }
    setFormData({ ...formData, deviceItems: newDeviceItems });
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="text"
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, price: value ? parseInt(value) : 0 });
                  }}
                  placeholder="500000"
                  required
                  disabled={loading}
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
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Device Items */}
        <Card>
          <CardHeader>
            <CardTitle>Thiết Bị Trong Combo *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              type="button" 
              onClick={handleAddDeviceItem} 
              variant="outline" 
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Thiết Bị
            </Button>

            {formData.deviceItems.length === 0 && (
              <p className="text-sm text-gray-500">Chưa có thiết bị nào. Vui lòng thêm ít nhất 1 thiết bị.</p>
            )}

            {formData.deviceItems.map((item, index) => (
              <div key={index} className="flex gap-4 items-end border p-4 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Thiết Bị *</Label>
                  <Select
                    value={item.deviceId}
                    onValueChange={(value) => handleDeviceItemChange(index, 'deviceId', value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thiết bị" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          {device.name} - {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(device.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-32 space-y-2">
                  <Label>Số Lượng *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleDeviceItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveDeviceItem(index)}
                  disabled={loading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hình Ảnh Combo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage || loading}
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage || loading}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingImage ? 'Đang upload...' : 'Upload Hình Ảnh'}
              </Button>
              <p className="text-sm text-gray-500 mt-2">Chọn một hoặc nhiều ảnh (tối đa 5MB mỗi ảnh)</p>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    <div className="aspect-square flex items-center justify-center p-2">
                      <img
                        src={url}
                        alt={`Combo ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={loading}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/equipment')} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Đang lưu...' : (isNew ? 'Tạo Combo' : 'Cập Nhật')}
          </Button>
        </div>
      </form>
    </div>
  );
}
