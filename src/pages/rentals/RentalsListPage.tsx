import { Eye, Filter, Search, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import * as bookingService from '../../lib/services/booking.service';
import type { Booking, BookingStatus, BookingStatistics } from '../../lib/types/booking.types';

const ITEMS_PER_PAGE = 10;

export function RentalsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<BookingStatistics>({
    totalBookings: 0,
    pendingBookings: 0,
    ongoingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load bookings from API
  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (startDateFrom) {
        params.startTimeFrom = new Date(startDateFrom).toISOString();
      }
      if (startDateTo) {
        params.startTimeTo = new Date(startDateTo).toISOString();
      }

      console.log('Fetching bookings with params:', params);
      const response = await bookingService.getManyBookings(params);
      console.log('Bookings response:', response);
      
      // Filter by search query on client side (if backend doesn't support it)
      let filteredBookings = response.bookings;
      if (debouncedSearchQuery.trim()) {
        const query = debouncedSearchQuery.toLowerCase();
        filteredBookings = filteredBookings.filter(
          (booking) =>
            booking.id.toLowerCase().includes(query) ||
            booking.userId.toLowerCase().includes(query) ||
            booking.vehicleId.toLowerCase().includes(query)
        );
      }
      
      setBookings(filteredBookings);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Không thể tải danh sách đơn thuê');
      setBookings([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, startDateFrom, startDateTo, debouncedSearchQuery]);

  useEffect(() => {
    loadBookings();
    loadStats();
  }, [loadBookings]);

  const loadStats = async () => {
    try {
      const data = await bookingService.getBookingStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Check if any advanced filters are active
  const hasActiveFilters = startDateFrom !== '' || startDateTo !== '';

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setStartDateFrom('');
    setStartDateTo('');
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Format date and time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge
  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      PENDING: { label: 'Chờ Thanh Toán', className: 'bg-yellow-100 text-yellow-800' },
      DEPOSIT_PAID: { label: 'Đã Cọc', className: 'bg-blue-100 text-blue-800' },
      FULLY_PAID: { label: 'Đã Thanh Toán', className: 'bg-green-100 text-green-800' },
      ONGOING: { label: 'Đang Thuê', className: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: 'Hoàn Thành', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Đã Hủy', className: 'bg-red-100 text-red-800' },
      EXPIRED: { label: 'Hết Hạn', className: 'bg-orange-100 text-orange-800' },
      OVERDUE: { label: 'Quá Hạn', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Statistics from API

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Quản Lý Đơn Thuê Phương Tiện</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý tất cả đơn thuê xe ô tô và xe máy
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Tổng Đơn</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Chờ Thanh Toán</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Đang Thuê</p>
          <p className="text-2xl font-bold text-purple-600">{stats.ongoingBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Hoàn Thành</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedBookings}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Đã Hủy</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, tên người dùng, xe..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value: BookingStatus | 'all') => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ Thanh Toán</SelectItem>
              <SelectItem value="DEPOSIT_PAID">Đã Cọc</SelectItem>
              <SelectItem value="FULLY_PAID">Đã Thanh Toán</SelectItem>
              <SelectItem value="ONGOING">Đang Thuê</SelectItem>
              <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
              <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
              <SelectItem value="EXPIRED">Hết Hạn</SelectItem>
              <SelectItem value="OVERDUE">Quá Hạn</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full md:w-auto"
          >
            <Filter className="h-4 w-4 mr-2" />
            Lọc Nâng Cao
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={resetFilters} className="w-full md:w-auto">
              <X className="h-4 w-4 mr-2" />
              Xóa Bộ Lọc
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <Label className="text-sm mb-2 block">Ngày Bắt Đầu Từ</Label>
              <Input
                type="date"
                value={startDateFrom}
                onChange={(e) => {
                  setStartDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div>
              <Label className="text-sm mb-2 block">Ngày Bắt Đầu Đến</Label>
              <Input
                type="date"
                value={startDateTo}
                onChange={(e) => {
                  setStartDateTo(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Đơn</TableHead>
              <TableHead>Người Thuê</TableHead>
              <TableHead>Phương Tiện</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead>Thời Lượng</TableHead>
              <TableHead>Tổng Tiền</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length > 0 ? (
              bookings.map((booking: Booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {booking.id.substring(0, 8)}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-gray-500">ID: {booking.userId.substring(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-gray-500">ID: {booking.vehicleId.substring(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{formatDateTime(booking.startTime)}</p>
                      <p className="text-gray-500">{formatDateTime(booking.endTime)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.duration >= 24 
                      ? `${Math.floor(booking.duration / 24)} ngày` 
                      : `${booking.duration} giờ`}
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(booking.totalAmount)}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(booking.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/vehicle-rentals/${booking.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  Không tìm thấy đơn thuê nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
}
