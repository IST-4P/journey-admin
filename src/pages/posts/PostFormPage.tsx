import { ArrowLeft, Plus, Save, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
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
import { mockPosts } from '../../lib/mockData';

interface PostFormData {
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  region: string;
  category: 'news' | 'guide' | 'promotion' | 'announcement';
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  featuredImage?: string;
  tags: string[];
  allowComments: boolean;
}

const initialFormData: PostFormData = {
  title: '',
  slug: '',
  author: 'Admin 1',
  content: '',
  excerpt: '',
  region: 'TP.HCM',
  category: 'news',
  status: 'draft',
  publishDate: new Date().toISOString().split('T')[0],
  featuredImage: '',
  tags: [],
  allowComments: true,
};

const regions = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Toàn Quốc'];

export function PostFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');

  // Load post data when editing
  useEffect(() => {
    if (!isNew && id) {
      const post = mockPosts.find((p) => p.id === Number(id));
      if (post) {
        setFormData({
          title: post.title,
          slug: post.slug,
          author: post.author,
          content: post.content,
          excerpt: post.excerpt,
          region: post.region,
          category: post.category,
          status: post.status,
          publishDate: post.publishDate,
          featuredImage: post.featuredImage,
          tags: post.tags,
          allowComments: post.allowComments,
        });
      }
    }
  }, [id, isNew]);

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData({ ...formData, slug });
    }
  }, [formData.title, isNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`${isNew ? 'Create' : 'Update'} post data:`, formData);
    navigate('/posts');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleAddFeaturedImage = () => {
    const url = prompt('Nhập URL hình ảnh đại diện:');
    if (url && url.trim()) {
      setFormData({ ...formData, featuredImage: url.trim() });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/posts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">
            {isNew ? 'Thêm Bài Viết Mới' : 'Chỉnh Sửa Bài Viết'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu Đề *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Nhập tiêu đề bài viết"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="bai-viet-mau"
                disabled={isNew}
                className={isNew ? 'bg-gray-50' : ''}
              />
              <p className="text-xs text-gray-500">
                {isNew ? 'Slug sẽ tự động tạo từ tiêu đề' : 'URL của bài viết'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Tác Giả *</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Admin 1"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishDate">Ngày Xuất Bản *</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Danh Mục *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: PostFormData['category']) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="news">Tin Tức</SelectItem>
                    <SelectItem value="guide">Hướng Dẫn</SelectItem>
                    <SelectItem value="promotion">Khuyến Mãi</SelectItem>
                    <SelectItem value="announcement">Thông Báo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Khu Vực *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value) => setFormData({ ...formData, region: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng Thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: PostFormData['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Đã Xuất Bản</SelectItem>
                    <SelectItem value="archived">Lưu Trữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Nội Dung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="excerpt">Tóm Tắt *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Nhập tóm tắt ngắn gọn của bài viết"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500">
                Tóm tắt ngắn gọn sẽ hiển thị trong danh sách bài viết
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội Dung Chi Tiết *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập nội dung chi tiết của bài viết"
                rows={15}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle>Hình Ảnh Đại Diện</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button type="button" onClick={handleAddFeaturedImage} variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              {formData.featuredImage ? 'Thay Đổi Hình Ảnh' : 'Thêm Hình Ảnh'}
            </Button>

            {formData.featuredImage && (
              <div className="relative inline-block">
                <img
                  src={formData.featuredImage}
                  alt="Featured"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x200';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, featuredImage: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Thẻ (Tags)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Nhập thẻ..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" onClick={handleAddTag}>
                Thêm
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-full"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Cài Đặt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allowComments"
                checked={formData.allowComments}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, allowComments: checked as boolean })
                }
              />
              <Label htmlFor="allowComments" className="cursor-pointer">
                Cho phép bình luận
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/posts')}>
            Hủy
          </Button>
          <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
            <Save className="h-4 w-4 mr-2" />
            {isNew ? 'Tạo Bài Viết' : 'Cập Nhật'}
          </Button>
        </div>
      </form>
    </div>
  );
}
