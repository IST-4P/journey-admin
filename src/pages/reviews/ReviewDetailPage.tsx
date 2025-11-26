import { ArrowLeft, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { getReview, type Review } from '../../lib/services/review.service';
import { toast } from 'sonner';

export function ReviewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchReview();
    }
  }, [id]);

  const fetchReview = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getReview(id);
      console.log('Review detail:', data);
      setReview(data);
    } catch (error) {
      console.error('Error fetching review:', error);
      toast.error('Không thể tải thông tin đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const getReviewType = () => {
    if (!review) return 'Khác';
    if (review.deviceId) return 'Thiết Bị';
    if (review.bookingId) return 'Booking';
    if (review.rentalId) return 'Rental';
    return 'Khác';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Không tìm thấy đánh giá</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/reviews')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">Chi Tiết Đánh Giá</h2>
        </div>
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
                <p className="text-sm text-gray-600 mb-1">ID Đánh Giá</p>
                <p className="font-mono text-sm">{review.id}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Loại</p>
                <Badge variant="outline">{getReviewType()}</Badge>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">ID Người Dùng</p>
                <p className="font-mono text-sm">{review.userId}</p>
              </div>

              {review.deviceId && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Thiết Bị</p>
                  <p className="font-mono text-sm">{review.deviceId}</p>
                </div>
              )}

              {review.bookingId && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Booking</p>
                  <p className="font-mono text-sm">{review.bookingId}</p>
                </div>
              )}

              {review.rentalId && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID Rental</p>
                  <p className="font-mono text-sm">{review.rentalId}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Tiêu Đề</p>
              <p className="text-lg font-medium">{review.title}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-2">Số Sao</p>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-2 text-lg font-medium">{review.rating} / 5</span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Nội Dung</p>
              <p className="whitespace-pre-wrap">{review.content}</p>
            </div>

            {/* Images */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Hình Ảnh ({review.images.length})</p>
              {review.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {review.images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Review ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(url, '_blank')}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có hình ảnh</p>
              )}
            </div>

            <div className="text-sm text-gray-600 pt-4 border-t space-y-1">
              <p>Ngày tạo: {formatDate(review.createdAt)}</p>
              <p>Ngày cập nhật: {formatDate(review.updatedAt)}</p>
              {review.updateCount !== undefined && review.updateCount > 0 && (
                <p>Số lần cập nhật: {review.updateCount}</p>
              )}
              {review.type !== undefined && (
                <p>Type: {review.type}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side Info */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Khác</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Trạng thái</p>
              <Badge className="bg-green-500">Đã đăng</Badge>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500">
                Đánh giá từ người dùng về trải nghiệm sử dụng dịch vụ.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
