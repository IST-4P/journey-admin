import { ArrowLeft, Save, Star, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
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
import { mockCombos, mockEquipment, mockReviews, mockUsers, mockVehicles } from '../../lib/mockData';

export function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const isEdit = window.location.pathname.includes('/edit');

  const reviewData = isNew ? null : mockReviews.find((r) => r.id === Number(id));

  const [formData, setFormData] = useState({
    userId: reviewData?.userId || 1,
    type: reviewData?.type || 'car',
    itemId: reviewData?.itemId || 1,
    title: reviewData?.title || '',
    rating: reviewData?.rating || 5,
    comment: reviewData?.comment || '',
    images: reviewData?.images || [],
  });

  const handleSave = () => {
    // In a real app, save to backend
    navigate('/reviews');
  };

  const handleAddImage = () => {
    const url = prompt('Nhập URL hình ảnh:');
    if (url && url.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, url.trim()],
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const viewMode = !isNew && !isEdit;

  // Get items based on type
  const getAvailableItems = () => {
    switch (formData.type) {
      case 'car':
        return mockVehicles.filter(v => v.type === 'car').slice(0, 20);
      case 'motorbike':
        return mockVehicles.filter(v => v.type === 'motorbike').slice(0, 20);
      case 'equipment':
        return mockEquipment.slice(0, 20);
      case 'combo':
        return mockCombos;
      default:
        return [];
    }
  };

  const getCurrentItemName = () => {
    const items = getAvailableItems();
    const item = items.find((i) => i.id === formData.itemId);
    return item?.name || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/reviews')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? 'Tạo Đánh Giá Mới' : isEdit ? 'Chỉnh Sửa Đánh Giá' : 'Chi Tiết Đánh Giá'}
          </h2>
        </div>
        {viewMode && (
          <Button
            onClick={() => navigate(`/reviews/${id}/edit`)}
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
            <CardTitle>Thông Tin Đánh Giá</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="userId">Người Đánh Giá *</Label>
                {viewMode ? (
                  <p className="mt-1">
                    {mockUsers.find((u) => u.id === formData.userId)?.name || ''}
                  </p>
                ) : (
                  <Select
                    value={String(formData.userId)}
                    onValueChange={(value) => setFormData({ ...formData, userId: Number(value) })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.slice(0, 20).map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="type">Loại *</Label>
                {viewMode ? (
                  <p className="mt-1">
                    <Badge variant="outline">
                      {formData.type === 'car' ? 'Ô Tô' : formData.type === 'motorbike' ? 'Xe Máy' : formData.type === 'equipment' ? 'Thiết Bị' : 'Combo'}
                    </Badge>
                  </p>
                ) : (
                  <Select
                    value={formData.type}
                    onValueChange={(value: 'car' | 'motorbike' | 'equipment' | 'combo') =>
                      setFormData({ ...formData, type: value, itemId: 1 })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Ô Tô</SelectItem>
                      <SelectItem value="motorbike">Xe Máy</SelectItem>
                      <SelectItem value="equipment">Thiết Bị</SelectItem>
                      <SelectItem value="combo">Combo</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="itemId">
                {formData.type === 'car' ? 'Ô Tô' : formData.type === 'motorbike' ? 'Xe Máy' : formData.type === 'equipment' ? 'Thiết Bị' : 'Combo'} *
              </Label>
              {viewMode ? (
                <p className="mt-1">{getCurrentItemName()}</p>
              ) : (
                <Select
                  value={String(formData.itemId)}
                  onValueChange={(value) => setFormData({ ...formData, itemId: Number(value) })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableItems().map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Label htmlFor="title">Tiêu Đề *</Label>
              {viewMode ? (
                <p className="mt-2">{formData.title}</p>
              ) : (
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                  placeholder="Nhập tiêu đề đánh giá..."
                  required
                />
              )}
            </div>

            <div>
              <Label>Số Sao *</Label>
              {viewMode ? (
                <div className="flex items-center mt-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg">{formData.rating}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 mt-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 cursor-pointer transition-colors ${
                          rating <= formData.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2">{formData.rating} sao</span>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="comment">Nhận Xét</Label>
              {viewMode ? (
                <p className="mt-2 whitespace-pre-wrap">{formData.comment}</p>
              ) : (
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={6}
                  className="mt-1"
                  placeholder="Nhập nhận xét chi tiết..."
                />
              )}
            </div>

            {/* Images */}
            <div>
              <Label>Hình Ảnh</Label>
              {!viewMode && (
                <Button
                  type="button"
                  onClick={handleAddImage}
                  variant="outline"
                  className="mt-2 mb-3"
                  size="sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Thêm Hình Ảnh
                </Button>
              )}

              {formData.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Review ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150';
                        }}
                      />
                      {!viewMode && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-2">Chưa có hình ảnh</p>
              )}
            </div>

            {reviewData && (
              <div className="text-sm text-gray-600 pt-4 border-t space-y-1">
                <p>Ngày tạo: {reviewData.date}</p>
                <p>Ngày chỉnh sửa: {reviewData.updatedDate}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Người dùng có thể đăng tải đánh giá tự do</p>
              <p className="text-sm text-gray-500">Không cần phê duyệt</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {!viewMode && (
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate('/reviews')}>
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
