import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
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

export function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewEquipment = !id || id === 'new';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    status: 'AVAILABLE',
    price: '',
    description: '',
    information: [] as string[],
    quantity: '1',
  });

  const [images, setImages] = useState<string[]>([]);
  const [informationText, setInformationText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isNewEquipment && id) {
      fetchDevice();
    }
  }, [id, isNewEquipment]);

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
      
      // Uncomment below when correct API endpoint is available
      /*
      const response = await getAllCategories();
      console.log('Categories RAW response:', response);
      let categoryList: Category[] = [];
      
      if (Array.isArray(response)) {
        categoryList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        categoryList = response.data;
      }
      
      console.log('Final category list:', categoryList);
      setCategories(categoryList);
      */
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
      console.log('Device detail response:', response);
      const device = response;
      setFormData({
        name: device.name || '',
        categoryId: device.categoryId || '',
        status: device.status || 'AVAILABLE',
        price: device.price?.toString() || '',
        description: device.description || '',
        information: device.information || [],
        quantity: device.quantity?.toString() || '1',
      });
      setImages(device.images || []);
      setInformationText(device.information?.join('\n') || '');
    } catch (error) {
      console.error('Error fetching device:', error);
      toast.error('Không thể tải thông tin thiết bị');
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
      setImages([...images, ...uploadedUrls]);
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
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = {
        name: formData.name,
        categoryId: formData.categoryId,
        status: formData.status,
        price: Number(formData.price),
        description: formData.description,
        information: informationText.split('\n').filter(line => line.trim()),
        quantity: Number(formData.quantity),
        images: images,
      };

      console.log('Submitting device data:', data);

      if (isNewEquipment) {
        console.log('POST /device - Creating new device');
        await createDevice(data);
        toast.success('Tạo thiết bị thành công');
      } else {
        console.log(`PUT /device/${id} - Updating device`);
        await updateDevice(id!, data);
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

  if (loading && !isNewEquipment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/equipment')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1>{isNewEquipment ? 'Thêm Thiết Bị Mới' : 'Chi Tiết Thiết Bị'}</h1>
            <p className="text-gray-600">
              {isNewEquipment ? 'Nhập thông tin thiết bị' : `Mã thiết bị: ${id}`}
            </p>
          </div>
        </div>
        <Button className="bg-[#007BFF] hover:bg-blue-600" onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Lưu
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3>Thông Tin Cơ Bản</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tên Thiết Bị *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Dell XPS 15"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label>Danh Mục *</Label>
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

            <div>
              <Label>Trạng Thái *</Label>
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

            <div>
              <Label>Giá (VNĐ) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="50000"
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label>Số Lượng</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                min="1"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label>Mô Tả</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết về thiết bị..."
              rows={4}
              disabled={loading}
            />
          </div>

          <div>
            <Label>Thông Tin (mỗi dòng 1 mục)</Label>
            <Textarea
              value={informationText}
              onChange={(e) => setInformationText(e.target.value)}
              placeholder="16GB DDR5 RAM&#10;1TB NVMe SSD&#10;NVIDIA RTX 4050"
              rows={6}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">Mỗi dòng sẽ là một mục thông tin riêng biệt</p>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3>Hình Ảnh Thiết Bị</h3>
          
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

          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {images.map((image, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-square flex items-center justify-center p-2">
                    <img
                      src={image}
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
                    disabled={loading}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
