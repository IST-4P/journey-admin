import { Edit, Search, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { userService } from "../../lib/services/user.service";
import type { Profile, Role } from "../../lib/types/user.types";

const ITEMS_PER_PAGE = 15;

export function UsersListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [users, setUsers] = useState<Profile[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getAllProfiles({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        fullName: searchQuery || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
      });

      setUsers(response.profiles);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
    } catch (error) {
      console.error("Error fetching users:", error);
      // Toast error đã được xử lý bởi axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800";
      case "USER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "SUPER_ADMIN":
        return "Super Admin";
      case "USER":
        return "Người dùng";
      default:
        return role;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Quản Lý Người Dùng</h2>
        <Button
          onClick={() => navigate("/users/new")}
          className="bg-[#007BFF] hover:bg-[#0056b3]"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Tạo Mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value: string) =>
            setRoleFilter(value as Role | "all")
          }
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Lọc theo vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="USER">Người dùng</SelectItem>
            <SelectItem value="ADMIN">Quản trị viên</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Không có dữ liệu</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Họ Tên</TableHead>
                <TableHead>Số Điện Thoại</TableHead>
                <TableHead>Vai Trò</TableHead>
                <TableHead>Điểm Tín Nhiệm</TableHead>
                <TableHead>GPLX</TableHead>
                <TableHead>TK Ngân Hàng</TableHead>
                <TableHead>Ngày Đăng Ký</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow
                  key={user.id}
                  className={index % 2 === 0 ? "bg-gray-50" : ""}
                >
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.creditScore}</TableCell>
                  <TableCell>
                    {user.driverLicense ? (
                      <Badge
                        className={
                          user.driverLicense.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {user.driverLicense.isVerified
                          ? "Đã xác minh"
                          : "Chưa xác minh"}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.bankAccount ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        {user.bankAccount.bankCode}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">Chưa có</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/users/${user.id}`)}
                      title="Xem/Chỉnh sửa"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
