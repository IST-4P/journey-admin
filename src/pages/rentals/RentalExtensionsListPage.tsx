import { Clock, Eye, Filter, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
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
import * as bookingService from "../../lib/services/booking.service";
import { userService } from "../../lib/services/user.service";
import type {
  Extension,
  ExtensionStatus,
  GetExtensionListParams,
} from "../../lib/types/booking.types";

const ITEMS_PER_PAGE = 10;

export function RentalExtensionsListPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ExtensionStatus | "all">(
    "all"
  );
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const loadExtensions = async () => {
    setLoading(true);
    try {
      const params: GetExtensionListParams = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response = await bookingService.getExtensions(params);
      const list = response?.extensions || response?.data?.extensions || [];

      setExtensions(list);
      setTotalPages(response?.totalPages || response?.data?.totalPages || 1);
      setTotalItems(
        response?.totalItems || response?.data?.totalItems || list.length
      );

      const requesterIds = list
        .map((ext: Extension) => ext.requestedBy)
        .filter(Boolean);

      if (requesterIds.length > 0) {
        const uniqueIds = Array.from(new Set(requesterIds));
        const profilePromises = uniqueIds.map(async (userId) => {
          try {
            const profile = await userService.getProfile(userId);
            return { userId, name: profile.fullName || profile.email || "N/A" };
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return { userId, name: "N/A" };
          }
        });

        const profiles = await Promise.all(profilePromises);
        const nameMap: Record<string, string> = {};
        profiles.forEach(({ userId, name }) => {
          nameMap[userId] = name;
        });
        setUserNames(nameMap);
      }
    } catch (error: any) {
      console.error("Error loading extensions:", error);
      toast.error("Khong the tai danh sach gia han");
      setExtensions([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExtensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const filteredExtensions = extensions.filter((ext) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      ext.id.toLowerCase().includes(query) ||
      ext.bookingId.toLowerCase().includes(query) ||
      ext.requestedBy.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: ExtensionStatus) => {
    const statusConfig: Record<
      ExtensionStatus,
      { label: string; className: string }
    > = {
      PENDING: { label: "Chờ duyệt", className: "bg-yellow-100 text-yellow-800" },
      APPROVED: { label: "Đã duyệt", className: "bg-green-100 text-green-800" },
      REJECTED: { label: "Đã từ chối", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const stats = {
    total: totalItems || extensions.length,
    pending: extensions.filter((ext) => ext.status === "PENDING").length,
    approved: extensions.filter((ext) => ext.status === "APPROVED").length,
    rejected: extensions.filter((ext) => ext.status === "REJECTED").length,
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Gia Hạn Thuê Phương Tiện</h2>
          <p className="text-sm text-gray-600 mt-1">
            Theo dõi các yêu cầu gia hạn đơn thuê từ người dùng
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Tổng yêu cầu</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Đã duyệt</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Đã từ chối</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo mã yêu cầu, đơn thuê, người yêu cầu..."
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
            onValueChange={(value: ExtensionStatus | "all") => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ duyệt</SelectItem>
              <SelectItem value="APPROVED">Đã duyệt</SelectItem>
              <SelectItem value="REJECTED">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={resetFilters}
            className="w-full md:w-auto"
            disabled={!hasActiveFilters}
          >
            {hasActiveFilters ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Lọc
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã yêu cầu</TableHead>
              <TableHead>Đơn thuê</TableHead>
              <TableHead>Người yêu cầu</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Thời gian thêm</TableHead>
              <TableHead>Phí thêm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  Dang tai danh sach gia han...
                </TableCell>
              </TableRow>
            ) : filteredExtensions.length > 0 ? (
              filteredExtensions.map((ext) => (
                <TableRow key={ext.id}>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {ext.id.substring(0, 8)}...
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">{ext.bookingId.substring(0, 8)}...</p>
                      <p className="text-xs text-gray-500">Đầy đủ: {ext.bookingId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{userNames[ext.requestedBy] || "N/A"}</p>
                      <p className="text-xs text-gray-500">
                        {ext.requestedBy.substring(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p>Cũ: {formatDateTime(ext.originalEndTime)}</p>
                      <p className="text-green-600">Mới: {formatDateTime(ext.newEndTime)}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className="font-medium text-blue-600">
                      +{ext.additionalHours} giờ
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(ext.additionalAmount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(ext.status)}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDateTime(ext.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to={`/vehicle-rentals/${ext.bookingId}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                  Không có yêu cầu gia hạn nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
