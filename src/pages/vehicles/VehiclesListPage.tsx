import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Edit,
  Filter,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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
import { DeleteVehicleDialog } from "../../components/vehicles/DeleteVehicleDialog";
import * as vehicleService from "../../lib/services/vehicle.service";
import type { GetManyVehiclesResponse } from "../../lib/types/vehicle.types";

const ITEMS_PER_PAGE = 15;

export function VehiclesListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transmissionFilter, setTransmissionFilter] = useState("all");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("all");
  const [seatsFilter, setSeatsFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Sort states
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [vehiclesData, setVehiclesData] =
    useState<GetManyVehiclesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<string[]>([]);

  // Fetch vehicles from API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);

        const params: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: sortBy,
          order: sortOrder,
        };

        // Add filters
        if (searchQuery) params.name = searchQuery;
        if (typeFilter !== "all") params.type = typeFilter.toUpperCase();
        if (statusFilter !== "all") params.status = statusFilter.toUpperCase();
        if (transmissionFilter !== "all")
          params.transmission = transmissionFilter.toUpperCase();
        if (fuelTypeFilter !== "all")
          params.fuelType = fuelTypeFilter.toUpperCase();
        if (seatsFilter !== "all") params.seats = parseInt(seatsFilter);
        if (cityFilter !== "all") params.city = cityFilter;

        const data = await vehicleService.getManyVehicles(params);

        // Kiểm tra nếu data là object rỗng hoặc không có vehicles
        if (!data || Object.keys(data).length === 0 || !data.vehicles) {
          setVehiclesData({
            vehicles: [],
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            totalItems: 0,
            totalPages: 0,
          });
          setCities([]);
        } else {
          setVehiclesData(data);

          // Extract unique cities from all vehicles for filter dropdown
          const uniqueCities = Array.from(
            new Set(data.vehicles.map((v) => v.city).filter(Boolean))
          );
          setCities(uniqueCities);
        }
      } catch (error: any) {
        console.error("Error fetching vehicles:", error);
        toast.error(
          error.response?.data?.message || "Không thể tải danh sách phương tiện"
        );
        // Set empty data on error
        setVehiclesData({
          vehicles: [],
          page: 1,
          limit: ITEMS_PER_PAGE,
          totalItems: 0,
          totalPages: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [
    currentPage,
    searchQuery,
    typeFilter,
    statusFilter,
    transmissionFilter,
    fuelTypeFilter,
    seatsFilter,
    cityFilter,
    sortBy,
    sortOrder,
  ]);

  // Check if any advanced filters are active
  const hasActiveFilters =
    transmissionFilter !== "all" ||
    fuelTypeFilter !== "all" ||
    seatsFilter !== "all" ||
    cityFilter !== "all" ||
    priceMin !== "" ||
    priceMax !== "";

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setTransmissionFilter("all");
    setFuelTypeFilter("all");
    setSeatsFilter("all");
    setCityFilter("all");
    setPriceMin("");
    setPriceMax("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  // Get data from API response
  const vehicles = vehiclesData?.vehicles || [];
  const totalPages = vehiclesData?.totalPages || 0;
  const totalItems = vehiclesData?.totalItems || 0;

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "RENTED":
        return "bg-blue-100 text-blue-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      case "RESERVED":
        return "bg-purple-100 text-purple-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case "ACTIVE":
        return "Hoạt động";
      case "RENTED":
        return "Đang thuê";
      case "MAINTENANCE":
        return "Bảo trì";
      case "RESERVED":
        return "Đã đặt";
      case "INACTIVE":
        return "Không hoạt động";
      default:
        return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Handle sort column click
  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column with default desc order
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Render sort icon
  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 inline ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 inline ml-1" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Quản Lý Phương Tiện</h2>
        <Button
          className="bg-[#007BFF] hover:bg-[#0056b3]"
          onClick={() => navigate("/vehicles/new")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Phương Tiện
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên xe hoặc vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Loại xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="car">Ô tô</SelectItem>
              <SelectItem value="motorcycle">Xe máy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
              <SelectItem value="rented">Đang thuê</SelectItem>
              <SelectItem value="reserved">Đã đặt</SelectItem>
              <SelectItem value="maintenance">Bảo trì</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t">
          <div className="space-y-2">
            <Label>Sắp Xếp Theo</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Ngày tạo</SelectItem>
                <SelectItem value="name">Tên xe</SelectItem>
                <SelectItem value="type">Loại xe</SelectItem>
                <SelectItem value="brandId">Thương hiệu</SelectItem>
                <SelectItem value="modelId">Mẫu xe</SelectItem>
                <SelectItem value="seats">Số chỗ ngồi</SelectItem>
                <SelectItem value="fuelType">Nhiên liệu</SelectItem>
                <SelectItem value="transmission">Hộp số</SelectItem>
                <SelectItem value="pricePerDay">Giá thuê/ngày</SelectItem>
                <SelectItem value="pricePerHour">Giá thuê/giờ</SelectItem>
                <SelectItem value="city">Thành phố</SelectItem>
                <SelectItem value="ward">Quận/Huyện</SelectItem>
                <SelectItem value="status">Trạng thái</SelectItem>
                <SelectItem value="averageRating">Đánh giá</SelectItem>
                <SelectItem value="totalTrips">Số chuyến</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Thứ Tự</Label>
            <Select
              value={sortOrder}
              onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Tăng dần</SelectItem>
                <SelectItem value="desc">Giảm dần</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between border-t pt-3">
          <Button
            variant="ghost"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="text-[#007BFF] hover:text-[#0056b3]"
          >
            <Filter className="h-4 w-4 mr-2" />
            Bộ Lọc Nâng Cao
            {showAdvancedFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
            {hasActiveFilters && (
              <Badge className="ml-2 bg-[#007BFF]">
                {
                  Object.values({
                    transmissionFilter,
                    fuelTypeFilter,
                    seatsFilter,
                    cityFilter,
                    priceMin,
                    priceMax,
                  }).filter((v) => v && v !== "all").length
                }
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={resetFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa Bộ Lọc
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3 border-t">
            <div className="space-y-2">
              <Label>Hộp Số</Label>
              <Select
                value={transmissionFilter}
                onValueChange={setTransmissionFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hộp số" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="automatic">Tự động</SelectItem>
                  <SelectItem value="manual">Số sàn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nhiên Liệu</Label>
              <Select value={fuelTypeFilter} onValueChange={setFuelTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhiên liệu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="gasoline">Xăng</SelectItem>
                  <SelectItem value="diesel">Dầu Diesel</SelectItem>
                  <SelectItem value="electric">Điện</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="unleaded_gasoline">
                    Xăng không chì
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Số Chỗ Ngồi</Label>
              <Select value={seatsFilter} onValueChange={setSeatsFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn số chỗ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="2">2 chỗ</SelectItem>
                  <SelectItem value="4">4 chỗ</SelectItem>
                  <SelectItem value="5">5 chỗ</SelectItem>
                  <SelectItem value="7">7 chỗ</SelectItem>
                  <SelectItem value="9">9 chỗ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Thành Phố</Label>
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thành phố" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city || ""}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Giá Tối Thiểu (VNĐ/ngày)</Label>
              <Input
                type="number"
                placeholder="0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Giá Tối Đa (VNĐ/ngày)</Label>
              <Input
                type="number"
                placeholder="10,000,000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                min="0"
              />
            </div>
          </div>
        )}

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>
            Hiển thị <strong>{totalItems}</strong> phương tiện
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình Ảnh</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("name")}
                >
                  Tên Xe {renderSortIcon("name")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("type")}
                >
                  Loại {renderSortIcon("type")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("seats")}
                >
                  Số Chỗ {renderSortIcon("seats")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("pricePerDay")}
                >
                  Giá/Ngày {renderSortIcon("pricePerDay")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("city")}
                >
                  Vị Trí {renderSortIcon("city")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("averageRating")}
                >
                  Đánh Giá {renderSortIcon("averageRating")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("status")}
                >
                  Trạng Thái {renderSortIcon("status")}
                </TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-8 text-gray-500"
                  >
                    Không tìm thấy phương tiện nào
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((vehicle, index) => (
                  <TableRow
                    key={vehicle.id}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <TableCell>
                      <img
                        src={vehicle.images[0] || "/placeholder-car.jpg"}
                        alt={vehicle.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {vehicle.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {vehicle.type === "CAR" ? "Ô tô" : "Xe máy"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{vehicle.seats} chỗ</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(vehicle.pricePerDay)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{vehicle.city}</div>
                        <div className="text-gray-500">{vehicle.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{vehicle.averageRating.toFixed(1)}</span>
                        <span className="text-gray-400 text-sm ml-1">
                          ({vehicle.totalTrips} chuyến)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(vehicle.status)}>
                        {getStatusLabel(vehicle.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DeleteVehicleDialog
                          vehicleId={vehicle.id}
                          vehicleName={vehicle.name}
                          onConfirm={(id) => console.log("Delete vehicle:", id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
