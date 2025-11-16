import { ArrowLeft, Plus, Save, Upload, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
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
import { getDevice, createDevice, updateDevice, getAllCategories } from '../../lib/services/equipment.service';
import * as mediaService from '../../lib/services/media.service';
import { toast } from 'sonner';

interface Category {
  Id: string;
  Name: string;
  LogoUrl?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

interface EquipmentFormData {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  information: string[];
  quantity: number;
  status: string;
  images: string[];
}

const initialFormData: EquipmentFormData = {
  name: '',
  categoryId: '',
  description: '',
  price: 0,
  information: [],
  quantity: 1,
  status: 'AVAILABLE',
  images: [],
};

export function EquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<EquipmentFormData>(initialFormData);
  const [infoInput, setInfoInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load equipment data when editing
  useEffect(() => {
    if (!isNew && id) {
      fetchDevice();
    }
  }, [id, isNew]);

  const fetchCategories = async () => {
    try {
      // Hardcoded categories as fallback since /device-category returns 404
      const hardcodedCategories: Category[] = [
        {
          Id: 'c0000001-0000-0000-0000-000000000001',
          Name: 'Laptops',
          LogoUrl: 'https://example.com/icons/laptop.png'
        },
        {
          Id: 'c0000002-0000-0000-0000-000000000002',
          Name: 'Peripherals (Phụ kiện)',
          LogoUrl: 'https://example.com/icons/mouse.png'
        },
        {
          Id: 'c0000003-0000-0000-0000-000000000003',
          Name: 'Displays (Màn hình)',
          LogoUrl: 'https://example.com/icons/monitor.png'
        },
        {
          Id: 'c0000100-0000-0000-0000-000000000100',
          Name: 'Dụng Cụ Outdoor (Cắm Trại)',
          LogoUrl: 'https://example.com/icons/outdoor.png'
        }
      ];
      
      console.log('Using hardcoded categories:', hardcodedCategories);
      setCategories(hardcodedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    }
  };

  const fetchDevice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getDevice(id);
      console.log('Device form response:', response);
      const device = response;
      setFormData({
        name: device.name || '',
        categoryId: device.categoryId || '',
        description: device.description || '',
        price: device.price || 0,
        information: device.information || [],
        quantity: device.quantity || 1,
        status: device.status || 'AVAILABLE',
        images: device.images || [],
      });
      setImageUrls(device.images || []);
    } catch (error) {
      console.error('Error fetching device:', error);
      toast.error('Không thể tải thông tin thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        categoryId: formData.categoryId,
        status: formData.status,
        price: formData.price,
        description: formData.description,
        information: formData.information,
        quantity: formData.quantity,
        images: imageUrls,
      };

      console.log('Submitting device data:', submitData);

      if (isNew) {
        console.log('POST /device - Creating new device');
        await createDevice(submitData);
        toast.success('Tạo thiết bị thành công');
      } else {
        console.log(`PUT /device/${id} - Updating device`);
        await updateDevice(id!, submitData);
        toast.success('Cập nhật thiết bị thành công');
      }
      navigate('/equipment');
    } catch (error) {
      console.error('Error saving device:', error);
      toast.error('Không thể lưu thiết bị');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInfo = () => {
    if (infoInput.trim() && !formData.information.includes(infoInput.trim())) {
      setFormData({
        ...formData,
        information: [...formData.information, infoInput.trim()],
      });
      setInfoInput('');
    }
  };

  const handleRemoveInfo = (info: string) => {
    setFormData({
      ...formData,
      information: formData.information.filter((i) => i !== info),
    });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? 'Thêm Thiết Bị Mới' : 'Chỉnh Sửa Thiết Bị'}
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
                <Label htmlFor="name">Tên Thiết Bị *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dell XPS 15"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Danh Mục *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.Id} value={category.Id}>
                        {category.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="200000"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Số Lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  min="1"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng Thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Có sẵn</SelectItem>
                    <SelectItem value="In Stock">In Stock</SelectItem>
                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                    <SelectItem value="Unavailable">Không có sẵn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết về thiết bị"
                rows={4}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Kỹ Thuật</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={infoInput}
                onChange={(e) => setInfoInput(e.target.value)}
                placeholder="Nhập thông tin kỹ thuật..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInfo())}
                disabled={loading}
              />
              <Button type="button" onClick={handleAddInfo}>
                Thêm
              </Button>
            </div>

            {formData.information.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.information.map((info, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span>{info}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInfo(info)}
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
              variant="outline"
              disabled={isUploadingImage || loading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploadingImage ? 'Đang upload...' : 'Upload Hình Ảnh'}
            </Button>
            <p className="text-sm text-gray-500">Chọn một hoặc nhiều ảnh (tối đa 5MB mỗi ảnh)</p>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                    <div className="aspect-square flex items-center justify-center p-2">
                      <img
                        src={url}
                        alt={`Equipment ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                    </div>
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
          <Button type="button" variant="outline" onClick={() => navigate('/equipment')} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Đang lưu...' : (isNew ? 'Tạo Thiết Bị' : 'Cập Nhật')}
          </Button>
        </div>
      </form>
    </div>
  );
}
