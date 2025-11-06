import { ChevronDown, ChevronUp, Edit, Eye, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
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
import { mockCombos, mockEquipment } from '../../lib/mockData';

const ITEMS_PER_PAGE = 15;

export function EquipmentsListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('equipment');

  // Combo filters
  const [comboSearchQuery, setComboSearchQuery] = useState('');
  const [comboCurrentPage, setComboCurrentPage] = useState(1);

  // Get unique categories and brands
  const categories = Array.from(new Set(mockEquipment.map((e) => e.category).filter(Boolean)));
  const brands = Array.from(new Set(mockEquipment.map((e) => e.brand).filter(Boolean)));

  // Filter equipment
  const filteredEquipment = mockEquipment.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      equipment.id.toString().includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || equipment.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || equipment.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || equipment.brand === brandFilter;
    const matchesPriceMin = !priceMin || equipment.price >= Number(priceMin);
    const matchesPriceMax = !priceMax || equipment.price <= Number(priceMax);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesBrand &&
      matchesPriceMin &&
      matchesPriceMax
    );
  });

  // Filter combos
  const filteredCombos = mockCombos.filter((combo) =>
    combo.name.toLowerCase().includes(comboSearchQuery.toLowerCase()) ||
    combo.id.toString().includes(comboSearchQuery)
  );

  // Pagination for equipment
  const totalPages = Math.ceil(filteredEquipment.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEquipment = filteredEquipment.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Pagination for combos
  const comboTotalPages = Math.ceil(filteredCombos.length / ITEMS_PER_PAGE);
  const comboStartIndex = (comboCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedCombos = filteredCombos.slice(comboStartIndex, comboStartIndex + ITEMS_PER_PAGE);

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setBrandFilter('all');
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Hãng</Label>
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả hãng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả hãng</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
              brandFilter !== 'all' ||
              priceMin ||
              priceMax) && (
              <div className="flex items-center justify-between pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Tìm thấy {filteredEquipment.length} thiết bị
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên Thiết Bị</TableHead>
                  <TableHead>Danh Mục</TableHead>
                  <TableHead>Hãng</TableHead>
                  <TableHead>Giá/Ngày</TableHead>
                  <TableHead>Số Lượng</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead className="text-right">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEquipment.map((equipment, index) => (
                  <TableRow key={equipment.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell>{equipment.id}</TableCell>
                    <TableCell>{equipment.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{equipment.category}</Badge>
                    </TableCell>
                    <TableCell>{equipment.brand || '-'}</TableCell>
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
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                {paginatedCombos.map((combo, index) => (
                  <TableRow key={combo.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                    <TableCell>{combo.id}</TableCell>
                    <TableCell>{combo.name}</TableCell>
                    <TableCell>{combo.devices.length} thiết bị</TableCell>
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
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
