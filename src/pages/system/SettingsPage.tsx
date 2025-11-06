import { Download, Eye, Save, Search } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '../../components/common/Pagination';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Textarea } from '../../components/ui/textarea';
import { mockActivityLogs } from '../../lib/mockData';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

const ITEMS_PER_PAGE = 15;

export function SettingsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState(
    'Người thuê có thể hủy đơn miễn phí trong vòng 24 giờ trước khi thuê. Sau thời gian này, sẽ không được hoàn lại tiền cọc.'
  );

  // Filter activity logs
  const filteredLogs = mockActivityLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSaveSettings = () => {
    // In a real app, save to backend
    alert('Đã lưu cài đặt thành công!');
  };

  const handleBackup = () => {
    // In a real app, trigger backup
    alert('Đang tiến hành sao lưu dữ liệu...');
  };

  const handleExportData = () => {
    // In a real app, export data to CSV
    alert('Đang xuất dữ liệu...');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Quản Lý Hệ Thống & Cài Đặt</h2>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quy Định & Chính Sách</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cancellationPolicy">Chính Sách Hủy Đơn</Label>
            <Textarea
              id="cancellationPolicy"
              value={cancellationPolicy}
              onChange={(e) => setCancellationPolicy(e.target.value)}
              rows={6}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSaveSettings}
              className="bg-[#007BFF] hover:bg-[#0056b3]"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu Cài Đặt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup & Export */}
      <Card>
        <CardHeader>
          <CardTitle>Sao Lưu & Xuất Dữ Liệu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Sao Lưu Dữ Liệu</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác Nhận Sao Lưu</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn sao lưu toàn bộ dữ liệu hệ thống không? Quá trình
                    này có thể mất vài phút.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBackup}>Xác Nhận</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={handleExportData}>
              <Download className="h-4 w-4 mr-2" />
              Xuất Dữ Liệu (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Log Hoạt Động</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Hành Động</TableHead>
                  <TableHead>Người Thực Hiện</TableHead>
                  <TableHead>Thời Gian</TableHead>
                  <TableHead className="text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log, index) => (
                  <TableRow key={log.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell>{log.id}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
