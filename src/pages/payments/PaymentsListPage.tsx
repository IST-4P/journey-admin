import { Eye, Search, Download } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import * as paymentService from '../../lib/services/payment.service';
import type { Payment, PaymentStatus, PaymentType } from '../../lib/types/payment.types';

const ITEMS_PER_PAGE = 10;

export function PaymentsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<PaymentType | 'all'>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load payments from API
  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (debouncedSearchTerm.trim()) {
        params.paymentCode = debouncedSearchTerm.trim();
      }

      console.log('Loading payments with params:', params); // Debug log
      const response = await paymentService.getManyPayments(params);
      console.log('Response:', response); // Debug log
      
      setPayments(response.payments);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      console.error('Error loading payments:', error);
      toast.error('Không thể tải danh sách thanh toán');
      setPayments([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, typeFilter, debouncedSearchTerm]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      PAID: { label: 'Đã Thanh Toán', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Chờ Thanh Toán', className: 'bg-yellow-100 text-yellow-800' },
      FAILED: { label: 'Thất Bại', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: PaymentType) => {
    const typeConfig = {
      VEHICLE: { label: 'Phương Tiện', className: 'bg-blue-100 text-blue-800' },
      DEVICE: { label: 'Thiết Bị', className: 'bg-purple-100 text-purple-800' },
    };
    const config = typeConfig[type];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusLabel = (status: PaymentStatus): string => {
    const statusLabels = {
      PAID: 'Đã Thanh Toán',
      PENDING: 'Chờ Thanh Toán',
      FAILED: 'Thất Bại',
    };
    return statusLabels[status];
  };

  const getTypeLabel = (type: PaymentType): string => {
    const typeLabels = {
      VEHICLE: 'Phương Tiện',
      DEVICE: 'Thiết Bị',
    };
    return typeLabels[type];
  };

  const handleExport = async () => {
    try {
      toast.loading('Đang xuất dữ liệu...');
      
      // Fetch all payments (without pagination)
      const params: any = {
        page: 1,
        limit: 1000, // Get large number to export all
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (debouncedSearchTerm.trim()) {
        params.paymentCode = debouncedSearchTerm.trim();
      }

      const response = await paymentService.getManyPayments(params);
      
      // Prepare data for Excel
      const excelData = response.payments.map((payment, index) => ({
        'STT': index + 1,
        'Mã Thanh Toán': payment.paymentCode,
        'Số Thứ Tự': payment.sequenceNumber,
        'User ID': payment.userId,
        'Loại': getTypeLabel(payment.type),
        'Booking ID': payment.bookingId,
        'Số Tiền (VNĐ)': payment.amount,
        'Trạng Thái': getStatusLabel(payment.status),
        'Ngày Tạo': new Date(payment.createdAt).toLocaleString('vi-VN'),
        'Cập Nhật': new Date(payment.updatedAt).toLocaleString('vi-VN'),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 22 }, // Mã Thanh Toán
        { wch: 12 }, // Số Thứ Tự
        { wch: 38 }, // User ID
        { wch: 15 }, // Loại
        { wch: 38 }, // Booking ID
        { wch: 15 }, // Số Tiền
        { wch: 18 }, // Trạng Thái
        { wch: 20 }, // Ngày Tạo
        { wch: 20 }, // Cập Nhật
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Thanh Toán');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `DanhSachThanhToan_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(wb, filename);

      toast.dismiss();
      toast.success(`Đã xuất ${response.payments.length} thanh toán thành công!`);
    } catch (error) {
      console.error('Error exporting payments:', error);
      toast.dismiss();
      toast.error('Không thể xuất file Excel');
    }
  };

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
        <h2 className="text-2xl">Quản Lý Thanh Toán</h2>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm mã thanh toán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value: PaymentStatus | 'all') => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
              <SelectItem value="PAID">Đã Thanh Toán</SelectItem>
              <SelectItem value="PENDING">Chờ Thanh Toán</SelectItem>
              <SelectItem value="FAILED">Thất Bại</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value: PaymentType | 'all') => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất Cả Loại</SelectItem>
              <SelectItem value="VEHICLE">Phương Tiện</SelectItem>
              <SelectItem value="DEVICE">Thiết Bị</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Tìm thấy: <strong>{totalItems}</strong> thanh toán
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Thanh Toán</TableHead>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Số Tiền</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length > 0 ? (
              payments.map((payment: Payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {payment.paymentCode}
                    </code>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500">ID: {payment.userId}</span>
                  </TableCell>
                  <TableCell>{getTypeBadge(payment.type)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/payments/${payment.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Không tìm thấy thanh toán nào
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
