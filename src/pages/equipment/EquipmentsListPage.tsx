import { ChevronDown, ChevronUp, Edit, Eye, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { getManyDevices, getManyCombos, deleteDevice, deleteCombo } from '../../lib/services/equipment.service';
import { Device, Combo } from '../../lib/types';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export function EquipmentsListPage() {
  const navigate = useNavigate();
  
  // Equipment state
  const [devices, setDevices] = useState<Device[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loadingDevices, setLoadingDevices] = useState(false);

  // Combo state
  const [combos, setCombos] = useState<Combo[]>([]);
  const [comboCurrentPage, setComboCurrentPage] = useState(1);
  const [comboTotalPages, setComboTotalPages] = useState(1);
  const [comboTotalItems, setComboTotalItems] = useState(0);
  const [comboSearchQuery, setComboSearchQuery] = useState('');
  const [loadingCombos, setLoadingCombos] = useState(false);
  
  const [activeTab, setActiveTab] = useState('equipment');

  // Get unique categories from devices
  const categories = Array.from(new Set(devices.map((d) => d.categoryName).filter(Boolean)));

  // Fetch devices
  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const params: any = {
        limit: ITEMS_PER_PAGE,
        page: currentPage,
      };
      
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priceMin) params.minPrice = Number(priceMin);
      if (priceMax) params.maxPrice = Number(priceMax);

      const response = await getManyDevices(params);
      console.log('Device response:', response);
      setDevices(response.devices || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Không thể tải danh sách thiết bị');
    } finally {
      setLoadingDevices(false);
    }
  };

  // Fetch combos
  const fetchCombos = async () => {
    setLoadingCombos(true);
    try {
      const params: any = {
        limit: ITEMS_PER_PAGE,
        page: comboCurrentPage,
      };
      
      if (comboSearchQuery) params.search = comboSearchQuery;

      const response = await getManyCombos(params);
      console.log('Combo response:', response);
      setCombos(response.combos || []);
      setComboTotalPages(response.totalPages || 1);
      setComboTotalItems(response.totalItems || 0);
    } catch (error) {
      console.error('Error fetching combos:', error);
      toast.error('Không thể tải danh sách combo');
    } finally {
      setLoadingCombos(false);
    }
  };

  // Fetch devices on mount and when filters change
  useEffect(() => {
    fetchDevices();
  }, [currentPage, searchQuery, categoryFilter, statusFilter, priceMin, priceMax]);

  // Fetch combos on mount and when filters change
  useEffect(() => {
    fetchCombos();
  }, [comboCurrentPage, comboSearchQuery]);

  const handleDeleteDevice = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) return;
    
    try {
      await deleteDevice(id);
      toast.success('Xóa thiết bị thành công');
      fetchDevices();
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Không thể xóa thiết bị');
    }
  };

  const handleDeleteCombo = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa combo này?')) return;
    
    try {
      await deleteCombo(id);
      toast.success('Xóa combo thành công');
      fetchCombos();
    } catch (error) {
      console.error('Error deleting combo:', error);
      toast.error('Không thể xóa combo');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setPriceMin('');
    setPriceMax('');
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'rented':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'rented':
        return 'Đang cho thuê';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Quản Lý Thiết Bị & Combo</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="equipment">Thiết Bị</TabsTrigger>
          <TabsTrigger value="combo">Combo</TabsTrigger>
        </TabsList>

        {/* Equipment Tab */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="flex justify-end">
            <Button
              className="bg-[#007BFF] hover:bg-[#0056b3]"
              onClick={() => navigate('/equipment/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Thiết Bị
            </Button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="rented">Đang thuê</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Lọc nâng cao
                {showAdvancedFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>

            {showAdvancedFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Giá tối thiểu (VNĐ)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giá tối đa (VNĐ)</Label>
                  <Input
                    type="number"
                    placeholder="1000000"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(searchQuery ||
              categoryFilter !== 'all' ||
              statusFilter !== 'all' ||
              priceMin ||
              priceMax) && (
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Tìm thấy {totalItems} thiết bị
                </p>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>

          {/* Equipment Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loadingDevices ? (
              <div className="p-8 text-center">Đang tải...</div>
            ) : devices.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Không tìm thấy thiết bị nào</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên Thiết Bị</TableHead>
                    <TableHead>Danh Mục</TableHead>
                    <TableHead>Giá/Ngày</TableHead>
                    <TableHead>Số Lượng</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead className="text-right">Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((equipment: Device, index: number) => (
                    <TableRow key={equipment.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <TableCell className="font-mono text-xs">{equipment.id.slice(0, 8)}...</TableCell>
                      <TableCell>{equipment.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{equipment.categoryName}</Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(equipment.price)}</TableCell>
                      <TableCell>{equipment.quantity || 0}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(equipment.status)}>
                          {getStatusLabel(equipment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/equipment/${equipment.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/equipment/${equipment.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteDevice(equipment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </TabsContent>

        {/* Combo Tab */}
        <TabsContent value="combo" className="space-y-6">
          <div className="flex justify-end">
            <Button
              className="bg-[#007BFF] hover:bg-[#0056b3]"
              onClick={() => navigate('/equipment/combos/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Combo
            </Button>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm combo..."
                value={comboSearchQuery}
                onChange={(e) => setComboSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Combo Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loadingCombos ? (
              <div className="p-8 text-center">Đang tải...</div>
            ) : combos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Không tìm thấy combo nào</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên Combo</TableHead>
                    <TableHead>Số Thiết Bị</TableHead>
                    <TableHead>Giá/Ngày</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead className="text-right">Hành Động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combos.map((combo: Combo, index: number) => (
                    <TableRow key={combo.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <TableCell className="font-mono text-xs">{combo.id.slice(0, 8)}...</TableCell>
                      <TableCell>{combo.name}</TableCell>
                      <TableCell>{combo.deviceCount || 0} thiết bị</TableCell>
                      <TableCell>{formatCurrency(combo.price)}</TableCell>
                      <TableCell>{new Date(combo.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link to={`/equipment/combos/${combo.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/equipment/combos/${combo.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCombo(combo.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Pagination
            currentPage={comboCurrentPage}
            totalPages={comboTotalPages}
            onPageChange={setComboCurrentPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
