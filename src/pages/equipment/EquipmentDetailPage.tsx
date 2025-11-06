import { ArrowLeft, Save, Upload } from 'lucide-react';
import { useState } from 'react';
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

export function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewEquipment = !id || id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'available',
    price: '',
    deposit: '',
    owner: '',
    condition: '',
    description: '',
    specifications: '',
    quantity: '1',
  });

  const [images, setImages] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Equipment data:', formData);
    navigate('/equipment');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

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
                placeholder="VD: Máy khoan Bosch GSB 13 RE"
                required
              />
            </div>

            <div>
              <Label>Danh Mục *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="power-tools">Dụng cụ điện</SelectItem>
                  <SelectItem value="garden">Thiết bị vườn</SelectItem>
                  <SelectItem value="water">Thiết bị nước</SelectItem>
                  <SelectItem value="generator">Thiết bị điện</SelectItem>
                  <SelectItem value="tools">Dụng cụ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trạng Thái *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="rented">Đang thuê</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Tình Trạng</Label>
              <Select
                value={formData.condition}
                onValueChange={(value) => setFormData({ ...formData, condition: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tình trạng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Rất tốt</SelectItem>
                  <SelectItem value="good">Tốt</SelectItem>
                  <SelectItem value="fair">Khá</SelectItem>
                  <SelectItem value="poor">Cần sửa chữa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Giá Thuê/Ngày (VNĐ) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="50000"
                required
              />
            </div>

            <div>
              <Label>Tiền Cọc (VNĐ)</Label>
              <Input
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                placeholder="200000"
              />
            </div>

            <div>
              <Label>Số Lượng</Label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                min="1"
              />
            </div>

            <div>
              <Label>Chủ Sở Hữu</Label>
              <Input
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="Nguyễn Văn A"
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
            />
          </div>

          <div>
            <Label>Thông Số Kỹ Thuật</Label>
            <Textarea
              value={formData.specifications}
              onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
              placeholder="Công suất, kích thước, trọng lượng..."
              rows={4}
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <h3>Hình Ảnh Thiết Bị</h3>
          
          <div>
            <Label>Upload Hình Ảnh</Label>
            <div className="mt-2">
              <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#007BFF] transition-colors">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">Click để upload hình ảnh</p>
                  <p className="text-gray-400">hoặc kéo thả file vào đây</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Equipment ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
