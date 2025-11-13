import { ArrowDownLeft, ArrowUpRight, Download, Search } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
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
import * as transactionService from '../../lib/services/transaction.service';
import type { Transaction } from '../../lib/types/transaction.types';

/**
 * Transaction List Page - Bank Transactions Management
 * 
 * API Integration:
 * - Endpoint: GET /transaction
 * - Query Params:
 *   ✅ page (number) - Current page number
 *   ✅ limit (number) - Items per page
 *   ✅ gateway (string, optional) - Filter by bank gateway
 *   ✅ type (string, optional) - IN (tiền vào) | OUT (tiền ra)
 *   ✅ code (string, optional) - Search by transaction code
 *   ✅ startDate (string, optional) - ISO-8601 format
 *   ✅ endDate (string, optional) - ISO-8601 format
 * 
 * Filters:
 * - Search Box: Debounced 500ms, searches by transaction code
 * - Gateway Filter: Server-side filter by bank name
 * - Type Filter (In/Out): Server-side filter
 * - Date Range: Server-side filter by transaction date
 * 
 * Features:
 * - Server-side pagination and filtering
 * - Real-time summary cards (total in/out/net)
 * - Excel export with all filters applied
 */

const ITEMS_PER_PAGE = 15;

export function TransactionsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'IN' | 'OUT'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load transactions from API
  const loadTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      // Filter by type (IN/OUT)
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      
      // Search by transaction code
      if (debouncedSearchTerm.trim()) {
        params.code = debouncedSearchTerm.trim();
      }
      
      // Filter by date range (ISO-8601 format)
      if (startDate) {
        params.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        // Set to end of day
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        params.endDate = endDateTime.toISOString();
      }

      console.log('📤 API Request - GET /transaction');
      console.log('Parameters:', params);
      console.log('URL:', `${import.meta.env.VITE_API_BASE_URL}/transaction?${new URLSearchParams(params).toString()}`);
      
      const response = await transactionService.getManyTransactions(params);
      
      console.log('📥 API Response:', {
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        currentPage: response.page,
        itemsCount: response.transactions.length
      });
      
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error: any) {
      console.error('❌ Error loading transactions:', error);
      toast.error('Không thể tải danh sách giao dịch');
      setTransactions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, typeFilter, debouncedSearchTerm, startDate, endDate]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Calculate totals from filtered transactions (server-side filtered)
  const totalAmountIn = transactions.reduce((sum, t) => sum + t.amountIn, 0);
  const totalAmountOut = transactions.reduce((sum, t) => sum + t.amountOut, 0);
  const netAmount = totalAmountIn - totalAmountOut;

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

  const handleExport = async () => {
    try {
      toast.loading('Đang xuất dữ liệu...');
      
      // Fetch all transactions with current filters
      const params: any = {
        page: 1,
        limit: 1000,
      };

      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }
      if (debouncedSearchTerm.trim()) {
        params.code = debouncedSearchTerm.trim();
      }
      if (startDate) {
        params.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        params.endDate = endDateTime.toISOString();
      }

      const response = await transactionService.getManyTransactions(params);
      const exportTransactions = response.transactions;
      
      // Prepare data for Excel
      const excelData = exportTransactions.map((transaction, index) => ({
        'STT': index + 1,
        'Mã Giao Dịch': transaction.code,
        'Ngân Hàng': transaction.gateway,
        'Số Tài Khoản': transaction.accountNumber,
        'Nội Dung': transaction.transactionContent,
        'Tiền Vào (VNĐ)': transaction.amountIn,
        'Tiền Ra (VNĐ)': transaction.amountOut,
        'Chênh Lệch (VNĐ)': transaction.amountIn - transaction.amountOut,
        'Thời Gian': new Date(transaction.transactionDate).toLocaleString('vi-VN'),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 22 }, // Mã Giao Dịch
        { wch: 15 }, // Ngân Hàng
        { wch: 15 }, // Số Tài Khoản
        { wch: 60 }, // Nội Dung
        { wch: 15 }, // Tiền Vào
        { wch: 15 }, // Tiền Ra
        { wch: 18 }, // Chênh Lệch
        { wch: 20 }, // Thời Gian
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Giao Dịch');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `GiaoDichNganHang_${timestamp}.xlsx`;

      // Export file
      XLSX.writeFile(wb, filename);

      toast.dismiss();
      toast.success(`Đã xuất ${exportTransactions.length} giao dịch thành công!`);
    } catch (error) {
      console.error('Error exporting transactions:', error);
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
        <h2 className="text-2xl">Giao Dịch </h2>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Xuất Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700">Tiền Vào</p>
            <ArrowDownLeft className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-800">{formatCurrency(totalAmountIn)}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-700">Tiền Ra</p>
            <ArrowUpRight className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-800">{formatCurrency(totalAmountOut)}</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700">Chênh Lệch</p>
          </div>
          <p className={`text-xl font-bold ${netAmount >= 0 ? 'text-blue-800' : 'text-red-800'}`}>
            {formatCurrency(netAmount)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700 mb-2">Tổng Giao Dịch</p>
          <p className="text-xl font-bold text-gray-800">{totalItems}</p>
          <p className="text-xs text-gray-500 mt-1">Trang hiện tại: {transactions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm theo mã giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={typeFilter}
            onValueChange={(value: 'all' | 'IN' | 'OUT') => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="IN">Tiền Vào</SelectItem>
              <SelectItem value="OUT">Tiền Ra</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Tìm thấy: <strong>{totalItems}</strong> giao dịch
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã GD</TableHead>
              <TableHead>Ngân Hàng</TableHead>
              <TableHead>Số Tài Khoản</TableHead>
              <TableHead>Nội Dung</TableHead>
              <TableHead className="text-right">Tiền Vào</TableHead>
              <TableHead className="text-right">Tiền Ra</TableHead>
              <TableHead>Thời Gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction: Transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {transaction.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.gateway}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">{transaction.accountNumber}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {transaction.transactionContent}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.amountIn > 0 ? (
                      <span className="font-medium text-green-600 flex items-center justify-end gap-1">
                        <ArrowDownLeft className="h-4 w-4" />
                        {formatCurrency(transaction.amountIn)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {transaction.amountOut > 0 ? (
                      <span className="font-medium text-red-600 flex items-center justify-end gap-1">
                        <ArrowUpRight className="h-4 w-4" />
                        {formatCurrency(transaction.amountOut)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(transaction.transactionDate)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  Không tìm thấy giao dịch nào
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
