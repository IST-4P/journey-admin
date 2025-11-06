import { Eye, Search, Download } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { mockRefunds, RefundStatus } from '../../lib/mockData';

const ITEMS_PER_PAGE = 10;

export function RefundsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('all');

  // Filter refunds
  const filteredRefunds = mockRefunds.filter((refund) => {
    const matchesSearch =
      refund.paymentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRefunds = filteredRefunds.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const handleExport = () => {
    console.log('Exporting refunds...');
  };

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
              placeholder="Tìm mã thanh toán, người dùng..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="COMPLETED">Đã Hoàn Tiền</SelectItem>
              <SelectItem value="PENDING">Đang Xử Lý</SelectItem>
              <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Tìm thấy: <strong>{filteredRefunds.length}</strong> yêu cầu
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Đã Hoàn Tiền</p>
          <p className="text-2xl font-bold text-green-800">
            {mockRefunds.filter((r) => r.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Đang Xử Lý</p>
          <p className="text-2xl font-bold text-yellow-800">
            {mockRefunds.filter((r) => r.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-700 mb-1">Đã Hủy</p>
          <p className="text-2xl font-bold text-red-800">
            {mockRefunds.filter((r) => r.status === 'CANCELLED').length}
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
            {paginatedRefunds.length > 0 ? (
              paginatedRefunds.map((refund) => {
                const totalDeductions = refund.penaltyAmount + refund.damageAmount + refund.overtimeAmount;
                return (
                  <TableRow key={refund.id}>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {refund.paymentCode}
                      </code>
                    </TableCell>
                    <TableCell>{refund.userName}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(refund.amount)}</TableCell>
                    <TableCell className="text-red-600">
                      {totalDeductions > 0 ? `-${formatCurrency(totalDeductions)}` : '-'}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatCurrency(refund.finalAmount)}
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
