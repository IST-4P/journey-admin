import { Edit, Eye, Plus, Search, Trash } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
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
import { Textarea } from '../../components/ui/textarea';
import { mockNotifications, mockUsers } from '../../lib/mockData';

const ITEMS_PER_PAGE = 15;

export function NotificationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    content: '',
    recipientType: 'all',
    recipientId: '',
  });

  // Filter notifications
  const filteredNotifications = mockNotifications.filter((notification) => {
    return (
      notification.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.recipient.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleCreateNotification = () => {
    // In a real app, save to backend
    setIsCreateOpen(false);
    setNewNotification({ content: '', recipientType: 'all', recipientId: '' });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Quản Lý Thông Báo</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#007BFF] hover:bg-[#0056b3]">
              <Plus className="h-4 w-4 mr-2" />
              Tạo Thông Báo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tạo Thông Báo Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="content">Nội Dung *</Label>
                <Textarea
                  id="content"
                  value={newNotification.content}
                  onChange={(e) =>
                    setNewNotification({ ...newNotification, content: e.target.value })
                  }
                  rows={4}
                  placeholder="Nhập nội dung thông báo..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="recipientType">Người Nhận</Label>
                <Select
                  value={newNotification.recipientType}
                  onValueChange={(value) =>
                    setNewNotification({ ...newNotification, recipientType: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    <SelectItem value="individual">Cá nhân</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newNotification.recipientType === 'individual' && (
                <div>
                  <Label htmlFor="recipientId">Chọn Người Dùng</Label>
                  <Select
                    value={newNotification.recipientId}
                    onValueChange={(value) =>
                      setNewNotification({ ...newNotification, recipientId: value })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn người dùng..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockUsers.slice(0, 20).map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button
                  onClick={handleCreateNotification}
                  className="bg-[#007BFF] hover:bg-[#0056b3]"
                >
                  Gửi
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm thông báo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nội Dung</TableHead>
              <TableHead>Người Nhận</TableHead>
              <TableHead>Ngày Gửi</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedNotifications.map((notification, index) => (
              <TableRow key={notification.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <TableCell>{notification.id}</TableCell>
                <TableCell className="max-w-md truncate">{notification.content}</TableCell>
                <TableCell>{notification.recipient}</TableCell>
                <TableCell>{formatDateTime(notification.dateSent)}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      notification.status === 'sent'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }
                  >
                    {notification.status === 'sent' ? 'Đã Gửi' : 'Chờ Gửi'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
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
    </div>
  );
}
