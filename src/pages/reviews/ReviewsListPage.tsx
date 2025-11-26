import { Eye, Search, Star, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { getReviews, deleteReview, type Review } from '../../lib/services/review.service';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export function ReviewsListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [currentPage]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await getReviews({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      console.log('Reviews response:', response);
      setReviews(response.reviews);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;
    
    try {
      await deleteReview(reviewToDelete);
      toast.success('Đã xóa đánh giá thành công');
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Không thể xóa đánh giá');
    }
  };

  // Filter reviews locally
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRating =
      ratingFilter === 'all' || review.rating === Number(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const getReviewType = (review: Review) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Quản Lý Đánh Giá</h2>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo ID hoặc tiêu đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Số sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sao</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>
            Hiển thị <strong>{filteredReviews.length}</strong> / <strong>{totalItems}</strong> đánh giá
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">Đang tải...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Tiêu Đề</TableHead>
                <TableHead>Số Sao</TableHead>
                <TableHead>Hình Ảnh</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead>Ngày Cập Nhật</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500">
                    Không có đánh giá nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review, index) => (
                  <TableRow key={review.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell className="font-mono text-xs">
                      {review.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getReviewType(review)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{review.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                        <span className="ml-2">{review.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {review.images && review.images.length > 0 ? (
                        <div className="flex gap-1">
                          {review.images.slice(0, 2).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Review ${idx + 1}`}
                              className="w-8 h-8 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/50';
                              }}
                            />
                          ))}
                          {review.images.length > 2 && (
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
                              +{review.images.length - 2}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
                    <TableCell>{formatDate(review.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/reviews/${review.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReviewToDelete(review.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReviewToDelete(null)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
