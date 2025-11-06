import { ArrowDownLeft, ArrowUpRight, Download, Search } from 'lucide-react';
import { useState } from 'react';
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
import { mockTransactions } from '../../lib/mockData';

const ITEMS_PER_PAGE = 15;

export function TransactionsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'in' | 'out'>('all');

  // Get unique gateways
  const gateways = Array.from(new Set(mockTransactions.map((t) => t.gateway)));

  // Filter transactions
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transactionContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.accountNumber.includes(searchTerm);
    const matchesGateway = gatewayFilter === 'all' || transaction.gateway === gatewayFilter;
    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'in' && transaction.amountIn > 0) ||
      (typeFilter === 'out' && transaction.amountOut > 0);
    return matchesSearch && matchesGateway && matchesType;
  });

  // Calculate totals
  const totalAmountIn = filteredTransactions.reduce((sum, t) => sum + t.amountIn, 0);
  const totalAmountOut = filteredTransactions.reduce((sum, t) => sum + t.amountOut, 0);
  const netAmount = totalAmountIn - totalAmountOut;

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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

  const handleExport = () => {
    console.log('Exporting transactions...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Giao Dịch Ngân Hàng</h2>
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
          <p className="text-xl font-bold text-gray-800">{filteredTransactions.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm mã GD, nội dung, STK..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={gatewayFilter}
            onValueChange={(value) => {
              setGatewayFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ngân hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ngân hàng</SelectItem>
              {gateways.map((gateway) => (
                <SelectItem key={gateway} value={gateway}>
                  {gateway}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={typeFilter}
            onValueChange={(value: 'all' | 'in' | 'out') => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Loại giao dịch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="in">Tiền Vào</SelectItem>
              <SelectItem value="out">Tiền Ra</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center">
            <span className="text-sm text-gray-600">
              Tìm thấy: <strong>{filteredTransactions.length}</strong> giao dịch
            </span>
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
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((transaction) => (
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
