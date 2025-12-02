import { Eye, Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
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
import { getManyRentals } from '../../lib/services/equipment.service';
import { userService } from '../../lib/services/user.service';
import { Rental, RentalStatus } from '../../lib/types/rental.types';

export function EquipmentRentalsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RentalStatus | 'all'>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [startDateFrom, setStartDateFrom] = useState('');
  const [startDateTo, setStartDateTo] = useState('');
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Load rentals from API
  const loadRentals = async () => {
    setLoading(true);
    try {
      const data = await getManyRentals({
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? undefined : statusFilter,
        sortBy: 'createdAt',
        order: 'DESC',
      });

      console.log('Rentals API data:', data);
      // Axios interceptor return data từ response.data, nên:
      // data = { rentals: [...], page: 1, limit: 15, totalItems: 42, totalPages: 3 }
      const rentalsList = data?.rentals || [];
      console.log('Rentals list:', rentalsList);
      console.log('Total pages:', data?.totalPages);
      setRentals(rentalsList);
      setTotalPages(data?.totalPages || 1);

      // Fetch user names for rentals that don't have userName
      const userIdsToFetch = rentalsList
        .filter((r: Rental) => !r.userName && r.userId)
        .map((r: Rental) => r.userId);

      if (userIdsToFetch.length > 0) {
        const uniqueUserIds = [...new Set(userIdsToFetch)];
        const userNamePromises = uniqueUserIds.map(async (userId) => {
          try {
            const profile = await userService.getProfile(userId);
            return { userId, name: profile.fullName || profile.email || 'N/A' };
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return { userId, name: 'N/A' };
          }
        });

        const userNameResults = await Promise.all(userNamePromises);
        const userNameMap: Record<string, string> = {};
        userNameResults.forEach(({ userId, name }) => {
          userNameMap[userId] = name;
        });
        setUserNames(userNameMap);
      }
    } catch (error: any) {
      console.error('Error loading rentals:', error);
      if (error?.response?.status === 404 || error?.statusCode === 404) {
        setRentals([]);
        setTotalPages(1);
      } else {
        toast.error('Không thể tải danh sách đơn thuê');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRentals();
  }, [currentPage, statusFilter]);

  // Filter rentals locally for search and date filters
  const filteredRentals = rentals.filter((rental) => {
    const matchesSearch = !searchQuery || 
      (rental.userName && rental.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rental.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rental.userEmail && rental.userEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    const rentalStartDate = new Date(rental.startDate);
    const matchesStartDateFrom = !startDateFrom || rentalStartDate >= new Date(startDateFrom);
    const matchesStartDateTo = !startDateTo || rentalStartDate <= new Date(startDateTo);

    return matchesSearch && matchesStartDateFrom && matchesStartDateTo;
  });

  // Check if any advanced filters are active
  const hasActiveFilters = startDateFrom !== '' || startDateTo !== '' || searchQuery !== '';

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setStartDateFrom('');
    setStartDateTo('');
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
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
  const getStatusBadge = (status: RentalStatus) => {
    const statusConfig = {
      EXPIRED: { label: 'Đã Hết Hạn', className: 'bg-gray-100 text-gray-800' },
      ACTIVE: { label: 'Đang Hoạt Động', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Chờ Xử Lý', className: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Hoàn Thành', className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Đã Hủy', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Statistics
  const stats = {
    total: rentals.length,
    expired: rentals.filter((r) => r.status === 'EXPIRED').length,
    active: rentals.filter((r) => r.status === 'ACTIVE').length,
    pending: rentals.filter((r) => r.status === 'PENDING').length,
    completed: rentals.filter((r) => r.status === 'COMPLETED').length,
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
          <p className="text-sm text-gray-600">Chờ Xử Lý</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Đang Hoạt Động</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Hoàn Thành</p>
          <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
          <p className="text-sm text-gray-600">Đã Hết Hạn</p>
          <p className="text-2xl font-bold text-gray-600">{stats.expired}</p>
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
            onValueChange={(value: RentalStatus | 'all') => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ Xử Lý</SelectItem>
              <SelectItem value="ACTIVE">Đang Hoạt Động</SelectItem>
              <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
              <SelectItem value="EXPIRED">Đã Hết Hạn</SelectItem>
              <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
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
              <TableHead>Email</TableHead>
              <TableHead>Thời Gian</TableHead>
              <TableHead>Tổng Tiền</TableHead>
              <TableHead>Giảm Giá</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredRentals.length > 0 ? (
              filteredRentals.map((rental) => (
                <TableRow key={rental.id}>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {rental.id.substring(0, 8)}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rental.userName || userNames[rental.userId] || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{rental.userId.substring(0, 8)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{rental.userEmail || 'N/A'}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>{formatDateTime(rental.startDate)}</p>
                      <p className="text-gray-500">{formatDateTime(rental.endDate)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(rental.totalPrice)}</TableCell>
                  <TableCell className="text-sm">
                    {rental.discountPercent ? (
                      <span className="text-green-600">
                        {rental.discountPercent}%
                        {rental.maxDiscount && (
                          <span className="text-xs block text-gray-500">
                            Max: {formatCurrency(rental.maxDiscount)}
                          </span>
                        )}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(rental.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link to={`/equipment-rentals/${rental.id}`}>
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
