import { ArrowLeft, Plus, Save, Upload, X } from 'lucide-react';
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
import { mockEquipment } from '../../lib/mockData';

interface EquipmentFormData {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  information: string[];
  quantity: number;
  status: 'available' | 'rented' | 'maintenance';
  images: string[];
}

const initialFormData: EquipmentFormData = {
  name: '',
  brand: '',
  category: '',
  description: '',
  price: 0,
  information: [],
  quantity: 1,
  status: 'available',
  images: [],
};

const categories = ['Camping', 'Photography', 'Sports', 'Electronics', 'Tools', 'Outdoor', 'Music'];

export function EquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<EquipmentFormData>(initialFormData);
  const [infoInput, setInfoInput] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Load equipment data when editing
  useEffect(() => {
    if (!isNew && id) {
      const equipment = mockEquipment.find((e) => e.id === Number(id));
      if (equipment) {
        setFormData({
          name: equipment.name,
          brand: equipment.brand || '',
          category: equipment.category,
          description: equipment.description || '',
          price: equipment.price,
          information: equipment.information || [],
          quantity: equipment.quantity || 1,
          status: equipment.status,
          images: equipment.images || [],
        });
        setImageUrls(equipment.images || []);
      }
    }
  }, [id, isNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      images: imageUrls,
    };
    console.log(`${isNew ? 'Create' : 'Update'} equipment data:`, submitData);
    navigate('/equipment');
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
                  placeholder="Máy ảnh Canon EOS 90D"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Hãng</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Canon"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Danh Mục *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá/Ngày (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                  placeholder="200000"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Số Lượng *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng Thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EquipmentFormData['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Có sẵn</SelectItem>
                    <SelectItem value="rented">Đang cho thuê</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
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
                      alt={`Equipment ${index + 1}`}
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
            {isNew ? 'Tạo Thiết Bị' : 'Cập Nhật'}
          </Button>
        </div>
      </form>
    </div>
  );
}
