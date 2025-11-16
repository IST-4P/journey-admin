import { ArrowLeft, Minus, Plus, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { getCombo, createCombo, updateCombo } from '../../lib/services/equipment.service';
import { toast } from 'sonner';

interface ComboFormData {
  name: string;
  price: number;
  description: string;
  images: string[];
}

const initialFormData: ComboFormData = {
  name: '',
  price: 0,
  description: '',
  images: [],
};

export function ComboFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<ComboFormData>(initialFormData);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load combo data when editing
  useEffect(() => {
    if (!isNew && id) {
      fetchCombo();
    }
  }, [id, isNew]);

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
    setLoading(true);
    
    try {
      const submitData = {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        images: imageUrls,
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
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                  placeholder="500000"
                  min="0"
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

        {/* Note: Device management removed - API handles this separately */}
        <Card>
          <CardHeader>
            <CardTitle>Lưu ý</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Quản lý thiết bị trong combo sẽ được thực hiện thông qua API riêng biệt sau khi tạo combo.
            </p>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Hình Ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button type="button" onClick={handleAddImage} variant="outline" disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
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
