import { ChevronDown, ChevronUp, Edit, Eye, Filter, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/common/Pagination';
import { DeletePostDialog } from '../../components/posts/DeletePostDialog';
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
import { mockPosts } from '../../lib/mockData';

const ITEMS_PER_PAGE = 15;

export function PostsListPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Get unique authors from posts
  const authors = Array.from(new Set(mockPosts.map((p) => p.author)));

  // Filter posts
  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesAuthor = authorFilter === 'all' || post.author === authorFilter;

    const postDate = new Date(post.publishDate);
    const matchesDateFrom = !dateFrom || postDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || postDate <= new Date(dateTo);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesAuthor &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  // Check if any advanced filters are active
  const hasActiveFilters =
    authorFilter !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setAuthorFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'news':
        return 'Tin Tức';
      case 'guide':
        return 'Hướng Dẫn';
      case 'promotion':
        return 'Khuyến Mãi';
      case 'announcement':
        return 'Thông Báo';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'news':
        return 'bg-blue-100 text-blue-800';
      case 'guide':
        return 'bg-green-100 text-green-800';
      case 'promotion':
        return 'bg-purple-100 text-purple-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Nháp';
      case 'published':
        return 'Đã Xuất Bản';
      case 'archived':
        return 'Lưu Trữ';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
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
              placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc thẻ..."
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
              <SelectItem value="news">Tin Tức</SelectItem>
              <SelectItem value="guide">Hướng Dẫn</SelectItem>
              <SelectItem value="promotion">Khuyến Mãi</SelectItem>
              <SelectItem value="announcement">Thông Báo</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="draft">Nháp</SelectItem>
              <SelectItem value="published">Đã Xuất Bản</SelectItem>
              <SelectItem value="archived">Lưu Trữ</SelectItem>
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
              <Badge className="ml-2 bg-[#007BFF]">
                {Object.values({ authorFilter, dateFrom, dateTo }).filter(v => v && v !== 'all').length}
              </Badge>
            )}
          </Button>
          {(hasActiveFilters || searchQuery || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <Button variant="ghost" onClick={resetFilters} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-2" />
              Xóa Bộ Lọc
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t">
            <div className="space-y-2">
              <Label>Tác Giả</Label>
              <Select value={authorFilter} onValueChange={setAuthorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tác giả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Từ Ngày</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Đến Ngày</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t">
          <span>
            Hiển thị <strong>{filteredPosts.length}</strong> bài viết
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Tiêu Đề</TableHead>
              <TableHead>Danh Mục</TableHead>
              <TableHead>Tác Giả</TableHead>
              <TableHead>Trạng Thái</TableHead>
              <TableHead>Ngày Xuất Bản</TableHead>
              <TableHead>Lượt Xem</TableHead>
              <TableHead className="text-right">Hành Động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPosts.map((post, index) => (
              <TableRow key={post.id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <TableCell>{post.id}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="max-w-xs truncate">{post.title}</div>
                    {post.excerpt && (
                      <div className="text-xs text-gray-500 max-w-xs truncate">{post.excerpt}</div>
                    )}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{post.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(post.category)}>
                    {getCategoryLabel(post.category)}
                  </Badge>
                </TableCell>
                <TableCell>{post.author}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(post.status)}>
                    {getStatusLabel(post.status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(post.publishDate)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3 text-gray-500" />
                    <span className="text-sm">{formatNumber(post.viewCount)}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Link to={`/posts/${post.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/posts/${post.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <DeletePostDialog
                      postId={post.id}
                      postTitle={post.title}
                      onConfirm={(id) => console.log('Delete post:', id)}
                    />
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
