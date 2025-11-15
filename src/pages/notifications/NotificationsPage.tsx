import { Bell, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
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
import { Textarea } from '../../components/ui/textarea';
import { notificationService } from '../../lib/services/notification.service';
import { userService } from '../../lib/services/user.service';

interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
}

export function NotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newNotification, setNewNotification] = useState({
    title: '',
    content: '',
    recipientType: 'all',
    recipientId: '',
    type: 'WELCOME',
  });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllProfiles({ page: 1, limit: 100 });
      setUsers(
        response.profiles.map((profile) => ({
          userId: profile.id,
          fullName: profile.fullName,
          email: profile.email,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateNotification = async () => {
    // Kiểm tra validation
    if (!newNotification.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề thông báo');
      return;
    }
    if (!newNotification.content.trim()) {
      toast.error('Vui lòng nhập nội dung thông báo');
      return;
    }

    // Nếu gửi cho cá nhân, kiểm tra recipientId
    if (newNotification.recipientType === 'individual' && !newNotification.recipientId) {
      toast.error('Vui lòng chọn người nhận');
      return;
    }

    try {
      setIsLoading(true);

      if (newNotification.recipientType === 'all') {
        // Gửi broadcast notification
        const response = await notificationService.broadcastNotification({
          title: newNotification.title,
          content: newNotification.content,
          type: newNotification.type,
        });

        toast.success(
          `Đã gửi thông báo thành công đến ${response.totalCreated} người dùng`
        );
      } else {
        // Gửi notification cho một user cụ thể
        await notificationService.createNotification({
          userId: newNotification.recipientId,
          type: newNotification.type,
          title: newNotification.title,
          content: newNotification.content,
        });

        const selectedUser = users.find((u) => u.userId === newNotification.recipientId);
        toast.success(
          `Đã gửi thông báo thành công đến ${selectedUser?.fullName || 'người dùng'}`
        );
      }

      // Reset form
      setNewNotification({
        title: '',
        content: '',
        recipientType: 'all',
        recipientId: '',
        type: 'WELCOME',
      });
    } catch (error) {
      // Error đã được xử lý bởi axios interceptor
      console.error('Failed to send notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Bell className="h-8 w-8 text-[#007BFF]" />
        <h2 className="text-2xl font-bold">Gửi Thông Báo</h2>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu Đề *</Label>
            <Input
              id="title"
              value={newNotification.title}
              onChange={(e) =>
                setNewNotification({ ...newNotification, title: e.target.value })
              }
              placeholder="Nhập tiêu đề thông báo..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Nội Dung *</Label>
            <Textarea
              id="content"
              value={newNotification.content}
              onChange={(e) =>
                setNewNotification({ ...newNotification, content: e.target.value })
              }
              rows={5}
              placeholder="Nhập nội dung thông báo..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Loại Thông Báo</Label>
              <Select
                value={newNotification.type}
                onValueChange={(value: string) =>
                  setNewNotification({ ...newNotification, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WELCOME">Chào mừng</SelectItem>
                  <SelectItem value="SYSTEM">Thông báo hệ thống</SelectItem>
                  <SelectItem value="PROMOTION">Khuyến mãi</SelectItem>
                  <SelectItem value="BOOKING">Đặt chỗ</SelectItem>
                  <SelectItem value="RENTAL">Thuê xe</SelectItem>
                  <SelectItem value="COMPLAINT">Khiếu nại</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientType">Người Nhận</Label>
              <Select
                value={newNotification.recipientType}
                onValueChange={(value: string) =>
                  setNewNotification({ ...newNotification, recipientType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả người dùng</SelectItem>
                  <SelectItem value="individual">Cá nhân</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {newNotification.recipientType === 'individual' && (
            <div className="space-y-2">
              <Label htmlFor="recipientId">Chọn Người Dùng</Label>
              <Select
                value={newNotification.recipientId}
                onValueChange={(value: string) =>
                  setNewNotification({ ...newNotification, recipientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người dùng..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {users.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500 text-center">
                      Đang tải danh sách người dùng...
                    </div>
                  ) : (
                    users.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.fullName}</span>
                          <span className="text-xs text-gray-500">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {newNotification.recipientId && (
                <p className="text-sm text-gray-600">
                  Đã chọn:{' '}
                  <span className="font-medium">
                    {users.find((u) => u.userId === newNotification.recipientId)
                      ?.fullName || ''}
                  </span>
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleCreateNotification}
              className="bg-[#007BFF] hover:bg-[#0056b3]"
              disabled={isLoading}
            >
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang gửi...' : 'Gửi Thông Báo'}
            </Button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl">
        <div className="flex items-start space-x-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Chọn "Tất cả người dùng" để gửi thông báo đến toàn bộ người dùng trong hệ thống</li>
              <li>Chọn "Cá nhân" để gửi thông báo đến một người dùng cụ thể</li>
              <li>Thông báo sẽ được gửi ngay lập tức sau khi nhấn nút "Gửi"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
