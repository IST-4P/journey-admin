import { ChevronDown, ChevronUp, Edit, Eye, Filter, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { DeletePostDialog } from '../../components/posts/DeletePostDialog';
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
import { deleteBlog, getManyBlogs } from '../../lib/services/blog.service';
import type { BlogListItem } from '../../lib/types/blog.types';

const ITEMS_PER_PAGE = 10;
const REGIONS = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'];

export function PostsListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'createdAt' | 'updatedAt'>('updatedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // API data states
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await getManyBlogs({
        title: searchQuery || undefined,
        tag: tagFilter || undefined,
        type: typeFilter || undefined,
        region: regionFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });

      setBlogs(response.blogs);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch blogs when filters or page change
  useEffect(() => {
    fetchBlogs();
  }, [currentPage, searchQuery, tagFilter, typeFilter, regionFilter, startDate, endDate, sortBy, sortOrder]);

  // Handle delete blog
  const handleDeleteBlog = async (id: string) => {
    try {
      await deleteBlog({ id });
      toast.success('Xóa bài viết thành công');
      fetchBlogs(); // Refresh the list
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Không thể xóa bài viết');
    }
  };

  // Check if any filters are active
  const hasActiveFilters = typeFilter !== '' || regionFilter !== '' || tagFilter !== '' || startDate !== '' || endDate !== '';

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setTagFilter('');
    setTypeFilter('');
    setRegionFilter('');
    setStartDate('');
    setEndDate('');
    setSortBy('updatedAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getCategoryColor = (type: string) => {
    // Generate color based on type string
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    const hash = type.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl">Quản Lý Bài Viết</h2>
        <Button 
          className="bg-[#007BFF] hover:bg-[#0056b3]"
          onClick={() => navigate('/posts/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm Bài Viết
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        {/* Basic Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tiêu đề..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Input
            placeholder="Tìm theo tag..."
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-[180px]"
          />
          <Input
            placeholder="Loại bài viết..."
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-[180px]"
          />
          <Select
            value={regionFilter}
            onValueChange={(value: string) => {
              setRegionFilter(value === 'all' ? '' : value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Khu vực..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khu vực</SelectItem>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Từ ngày</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Đến ngày</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Sắp xếp theo</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Tiêu đề</SelectItem>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="updatedAt">Ngày cập nhật</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Thứ tự</label>
              <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
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
        )}

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
                {[typeFilter, regionFilter, tagFilter, startDate, endDate].filter(v => v !== '').length}
              </Badge>
            )}
          </Button>
          {(hasActiveFilters || searchQuery) && (
            <Button variant="ghost" onClick={resetFilters} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-2" />
              Xóa Bộ Lọc
            </Button>
          )}
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>
            Hiển thị <strong>{totalItems}</strong> bài viết
            {isLoading && <span className="ml-2 text-gray-400">(Đang tải...)</span>}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thumbnail</TableHead>
              <TableHead>Tiêu Đề</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Khu Vực</TableHead>
              <TableHead>Ngày Tạo</TableHead>
              <TableHead>Ngày Cập Nhật</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Không tìm thấy bài viết nào
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog, index) => (
                <TableRow key={blog.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <TableCell>
                    <img
                      src={blog.thumbnail}
                      alt={blog.title}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/64';
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate font-medium">{blog.title}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(blog.type)}>
                      {blog.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{blog.region}</TableCell>
                  <TableCell>{formatDate(blog.createdAt)}</TableCell>
                  <TableCell>{formatDate(blog.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/posts/${blog.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/posts/${blog.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DeletePostDialog
                        postId={blog.id}
                        postTitle={blog.title}
                        onConfirm={handleDeleteBlog}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
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
