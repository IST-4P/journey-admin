import { ChevronDown, ChevronUp, Edit, Filter, Plus, Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { Badge } from '../../components/ui/badge';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { DeleteVehicleDialog } from '../../components/vehicles/DeleteVehicleDialog';
import { apiService, Vehicle } from '../../lib/api';
import { useToast } from '../../components/ui/use-toast';

const ITEMS_PER_PAGE = 10;

export function VehiclesListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
  const [seatsFilter, setSeatsFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // API state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [cities, setCities] = useState<string[]>([]);

  // Fetch vehicles from API
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getVehicles({
        limit: ITEMS_PER_PAGE,
        page: currentPage,
        search: searchQuery || undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        transmission: transmissionFilter !== 'all' ? transmissionFilter : undefined,
        fuelType: fuelTypeFilter !== 'all' ? fuelTypeFilter : undefined,
        seats: seatsFilter !== 'all' ? parseInt(seatsFilter) : undefined,
        city: cityFilter !== 'all' ? cityFilter : undefined,
        priceMin: priceMin ? parseInt(priceMin) : undefined,
        priceMax: priceMax ? parseInt(priceMax) : undefined,
      });

      setVehicles(response.data.vehicles);
      setTotalItems(response.data.totalItems);
      setTotalPages(response.data.totalPages);

      // Extract unique cities
      const uniqueCities = Array.from(new Set(response.data.vehicles.map(v => v.city).filter(Boolean)));
      if (uniqueCities.length > cities.length) {
        setCities(uniqueCities);
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tải danh sách phương tiện',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch vehicles when filters change
  useEffect(() => {
    fetchVehicles();
  }, [currentPage, searchQuery, typeFilter, statusFilter, transmissionFilter, fuelTypeFilter, seatsFilter, cityFilter, priceMin, priceMax]);

  // Check if any advanced filters are active
  const hasActiveFilters =
    transmissionFilter !== 'all' ||
    fuelTypeFilter !== 'all' ||
    seatsFilter !== 'all' ||
    cityFilter !== 'all' ||
    priceMin !== '' ||
    priceMax !== '';

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setStatusFilter('all');
    setTransmissionFilter('all');
    setFuelTypeFilter('all');
    setSeatsFilter('all');
    setCityFilter('all');
    setPriceMin('');
    setPriceMax('');
    setCurrentPage(1);
  };

  // Handle delete vehicle
  const handleDeleteVehicle = async (id: string) => {
    try {
      await apiService.deleteVehicle(id);
      toast({
        title: 'Thành công',
        description: 'Đã xóa phương tiện',
      });
      fetchVehicles(); // Refresh list
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa phương tiện',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'RESERVED':
        return 'Đã đặt';
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'INACTIVE':
        return 'Không hoạt động';
      default:
        return status;
    }
  };

  const getTransmissionLabel = (transmission: string) => {
    const transmissionUpper = transmission.toUpperCase();
    switch (transmissionUpper) {
      case 'AUTOMATIC':
        return 'Tự động';
      case 'MANUAL':
        return 'Số sàn';
      default:
        return transmission;
    }
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const fuelTypeUpper = fuelType.toUpperCase();
    switch (fuelTypeUpper) {
      case 'GASOLINE':
        return 'Xăng';
      case 'DIESEL':
        return 'Dầu Diesel';
      case 'ELECTRIC':
        return 'Điện';
      case 'HYBRID':
        return 'Hybrid';
      default:
        return fuelType;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Quản Lý Phương Tiện</h2>
        <Button 
          className="bg-[#007BFF] hover:bg-[#0056b3]"
          onClick={() => navigate('/vehicles/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Phương Tiện
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Basic Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên xe hoặc vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Loại xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại</SelectItem>
              <SelectItem value="CAR">Ô tô</SelectItem>
              <SelectItem value="MOTORBIKE">Xe máy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="RESERVED">Đã đặt</SelectItem>
              <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
              <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>
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
              <Badge className="ml-2 bg-[#007BFF]">{Object.values({transmissionFilter, fuelTypeFilter, seatsFilter, cityFilter, priceMin, priceMax}).filter(v => v && v !== 'all').length}</Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={resetFilters} className="text-red-600 hover:text-red-700">
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
              <Select value={transmissionFilter} onValueChange={setTransmissionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn hộp số" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="AUTOMATIC">Tự động</SelectItem>
                  <SelectItem value="MANUAL">Số sàn</SelectItem>
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
                  <SelectItem value="GASOLINE">Xăng</SelectItem>
                  <SelectItem value="DIESEL">Dầu Diesel</SelectItem>
                  <SelectItem value="ELECTRIC">Điện</SelectItem>
                  <SelectItem value="HYBRID">Hybrid</SelectItem>
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
                    <SelectItem key={city} value={city || ''}>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF]"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <p className="text-lg">Không tìm thấy phương tiện nào</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Hình ảnh</TableHead>
                <TableHead>Tên Xe</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Số chỗ</TableHead>
                <TableHead>Hộp số</TableHead>
                <TableHead>Nhiên liệu</TableHead>
                <TableHead>Giá/Ngày</TableHead>
                <TableHead>Vị Trí</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead className="text-right">Hành Động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle, index) => (
                <TableRow key={vehicle.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <TableCell>
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <img 
                        src={vehicle.images[0]} 
                        alt={vehicle.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {vehicle.type === 'CAR' ? 'Ô tô' : 'Xe máy'}
                    </Badge>
                  </TableCell>
                  <TableCell>{vehicle.seats} chỗ</TableCell>
                  <TableCell>{getTransmissionLabel(vehicle.transmission)}</TableCell>
                  <TableCell>{getFuelTypeLabel(vehicle.fuelType)}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(vehicle.pricePerDay)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{vehicle.city}</div>
                      <div className="text-gray-500 text-xs">{vehicle.ward}</div>
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
                        title="Xem chi tiết"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeleteVehicleDialog
                        vehicleId={vehicle.id}
                        vehicleName={vehicle.name}
                        onConfirm={handleDeleteVehicle}
                      />
                    </div>
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
