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
import * as refundService from '../../lib/services/refund.service';
import type { Refund, RefundStatus } from '../../lib/types/refund.types';

const ITEMS_PER_PAGE = 10;

export function RefundsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');
  const [refunds, setRefunds] = useState<Refund[]>([]);
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

  // Load refunds from API
  const loadRefunds = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      console.log('Loading refunds with params:', params); // Debug log
      const response = await refundService.getManyRefunds(params);
      console.log('Response:', response); // Debug log
      
      setRefunds(response.refunds);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      console.error('Error loading refunds:', error);
      toast.error('Không thể tải danh sách hoàn tiền');
      setRefunds([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearchTerm]);

  useEffect(() => {
    loadRefunds();
  }, [loadRefunds]);

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

  const getStatusBadge = (status: RefundStatus) => {
    const statusConfig = {
      COMPLETED: { label: 'Đã Hoàn Tiền', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Đang Xử Lý', className: 'bg-yellow-100 text-yellow-800' },
      CANCELLED: { label: 'Đã Hủy', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusLabel = (status: RefundStatus): string => {
    const statusLabels = {
      COMPLETED: 'Đã Hoàn Tiền',
      PENDING: 'Đang Xử Lý',
      CANCELLED: 'Đã Hủy',
    };
    return statusLabels[status];
  };

  const handleExport = async () => {
    try {
      toast.loading('Đang xuất dữ liệu...');
      
      // Fetch all refunds (without pagination)
      const params: any = {
        page: 1,
        limit: 1000, // Get large number to export all
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (debouncedSearchTerm.trim()) {
        params.search = debouncedSearchTerm.trim();
      }

      const response = await refundService.getManyRefunds(params);
      
      // Prepare data for Excel
      const excelData = response.refunds.map((refund, index) => {
        const totalDeductions = refund.penaltyAmount + refund.damageAmount + refund.overtimeAmount;
        const finalAmount = refund.amount - totalDeductions;
        
        return {
          'STT': index + 1,
          'ID Hoàn Tiền': refund.id,
          'User ID': refund.userId,
          'Booking ID': refund.bookingId,
          'Số Tiền Gốc (VNĐ)': refund.principal,
          'Số Tiền Hoàn (VNĐ)': refund.amount,
          'Phí Phạt (VNĐ)': refund.penaltyAmount,
          'Phí Thiệt Hại (VNĐ)': refund.damageAmount,
          'Phí Quá Hạn (VNĐ)': refund.overtimeAmount,
          'Tổng Phí Trừ (VNĐ)': totalDeductions,
          'Thực Nhận (VNĐ)': finalAmount,
          'Tỷ Lệ Hoàn (%)': ((finalAmount / refund.amount) * 100).toFixed(2),
          'Trạng Thái': getStatusLabel(refund.status),
          'Ngày Tạo': new Date(refund.createdAt).toLocaleString('vi-VN'),
          'Cập Nhật': new Date(refund.updatedAt).toLocaleString('vi-VN'),
        };
      });

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 38 }, // ID Hoàn Tiền
        { wch: 38 }, // User ID
        { wch: 38 }, // Booking ID
        { wch: 18 }, // Số Tiền Gốc
        { wch: 18 }, // Số Tiền Hoàn
        { wch: 15 }, // Phí Phạt
        { wch: 18 }, // Phí Thiệt Hại
        { wch: 16 }, // Phí Quá Hạn
        { wch: 16 }, // Tổng Phí Trừ
        { wch: 16 }, // Thực Nhận
        { wch: 15 }, // Tỷ Lệ Hoàn
        { wch: 18 }, // Trạng Thái
        { wch: 20 }, // Ngày Tạo
        { wch: 20 }, // Cập Nhật
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Hoàn Tiền');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `DanhSachHoanTien_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(wb, filename);

      toast.dismiss();
      toast.success(`Đã xuất ${response.refunds.length} yêu cầu hoàn tiền thành công!`);
    } catch (error) {
      console.error('Error exporting refunds:', error);
      toast.dismiss();
      toast.error('Không thể xuất file Excel');
    }
  };

  // Calculate stats from current loaded refunds
  const stats = {
    completed: refunds.filter((r) => r.status === 'COMPLETED').length,
    pending: refunds.filter((r) => r.status === 'PENDING').length,
    cancelled: refunds.filter((r) => r.status === 'CANCELLED').length,
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
        <h2 className="text-2xl">Quản Lý Hoàn Tiền</h2>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value: RefundStatus | 'all') => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
              <SelectItem value="COMPLETED">Đã Hoàn Tiền</SelectItem>
              <SelectItem value="PENDING">Đang Xử Lý</SelectItem>
              <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Tìm thấy: <strong>{totalItems}</strong> yêu cầu
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Đã Hoàn Tiền</p>
          <p className="text-2xl font-bold text-green-800">
            {stats.completed}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Đang Xử Lý</p>
          <p className="text-2xl font-bold text-yellow-800">
            {stats.pending}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-700 mb-1">Đã Hủy</p>
          <p className="text-2xl font-bold text-red-800">
            {stats.cancelled}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã Thanh Toán</TableHead>
              <TableHead>Người Dùng</TableHead>
              <TableHead>Số Tiền Hoàn</TableHead>
              <TableHead>Phí Trừ</TableHead>
              <TableHead>Thực Nhận</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {refunds.length > 0 ? (
              refunds.map((refund: Refund) => {
                const totalDeductions = refund.penaltyAmount + refund.damageAmount + refund.overtimeAmount;
                const finalAmount = refund.amount - totalDeductions;
                return (
                  <TableRow key={refund.id}>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {refund.bookingId.substring(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">ID: {refund.userId.substring(0, 8)}...</span>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(refund.amount)}</TableCell>
                    <TableCell className="text-red-600">
                      {totalDeductions > 0 ? `-${formatCurrency(totalDeductions)}` : '-'}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(finalAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(refund.status)}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(refund.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/refunds/${refund.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  Không tìm thấy yêu cầu hoàn tiền nào
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
