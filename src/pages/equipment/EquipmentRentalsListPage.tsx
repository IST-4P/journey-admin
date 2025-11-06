import { Eye, Filter, Package, Search, Wrench, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { EquipmentBookingStatus, mockEquipmentBookings } from '../../lib/mockData';

const ITEMS_PER_PAGE = 15;

export function EquipmentRentalsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentBookingStatus | 'all'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');

  // Filter bookings
  const filteredBookings = mockEquipmentBookings.filter((booking) => {
    const matchesSearch =
      booking.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

    const bookingStartDate = new Date(booking.startTime);
    const matchesStartDateFrom = !startDateFrom || bookingStartDate >= new Date(startDateFrom);
    const matchesStartDateTo = !startDateTo || bookingStartDate <= new Date(startDateTo);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesStartDateFrom &&
      matchesStartDateTo
    );
  });

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

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
  const getStatusBadge = (status: EquipmentBookingStatus) => {
    const statusConfig = {
      PENDING: { label: 'Chờ Thanh Toán', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Đã Xác Nhận', className: 'bg-blue-100 text-blue-800' },
      READY_FOR_PICKUP: { label: 'Sẵn Sàng Nhận', className: 'bg-cyan-100 text-cyan-800' },
      ONGOING: { label: 'Đang Thuê', className: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: 'Hoàn Thành', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Đã Hủy', className: 'bg-red-100 text-red-800' },
      OVERDUE: { label: 'Quá Hạn', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Statistics
  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter((r) => r.status === 'PENDING').length,
    ongoing: filteredBookings.filter((r) => r.status === 'ONGOING').length,
    completed: filteredBookings.filter((r) => r.status === 'COMPLETED').length,
    cancelled: filteredBookings.filter((r) => r.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Quản Lý Đơn Thuê Thiết Bị</h2>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý tất cả đơn thuê thiết bị và combo
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Tổng Đơn</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Chờ Thanh Toán</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Đang Thuê</p>
          <p className="text-2xl font-bold text-purple-600">{stats.ongoing}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Hoàn Thành</p>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Đã Hủy</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo mã đơn, tên người dùng, thiết bị..."
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
            onValueChange={(value: EquipmentBookingStatus | 'all') => {
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
              <SelectItem value="CONFIRMED">Đã Xác Nhận</SelectItem>
              <SelectItem value="READY_FOR_PICKUP">Sẵn Sàng Nhận</SelectItem>
              <SelectItem value="ONGOING">Đang Thuê</SelectItem>
              <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
              <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
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
              <TableHead>Thiết Bị</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead>Thời Lượng</TableHead>
              <TableHead>Tổng Tiền</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{booking.id}</code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.userName}</p>
                      <p className="text-xs text-gray-500">{booking.userId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {booking.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {item.type === 'combo' ? (
                            <Package className="h-3 w-3 text-purple-600" />
                          ) : (
                            <Wrench className="h-3 w-3 text-blue-600" />
                          )}
                          <p className="text-sm">
                            {item.name} <span className="text-gray-500">x{item.quantity}</span>
                          </p>
                        </div>
                      ))}
                      {booking.items.length > 2 && (
                        <p className="text-xs text-gray-500">+{booking.items.length - 2} mục khác</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{formatDateTime(booking.startTime)}</p>
                      <p className="text-gray-500">{formatDateTime(booking.endTime)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.duration} ngày
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(booking.totalAmount)}</TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/equipment-rentals/${booking.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
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
