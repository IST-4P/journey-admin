import { Edit, Plus, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

interface PostFormData {
  title: string;
  slug: string;
  author: string;
  content: string;
  excerpt: string;
  category: 'news' | 'guide' | 'promotion' | 'announcement';
  status: 'draft' | 'published' | 'archived';
  publishDate: string;
  featuredImage?: string;
  tags: string[];
  allowComments: boolean;
}

interface PostFormDialogProps {
  mode?: 'create' | 'edit';
  postData?: Partial<PostFormData>;
  trigger?: React.ReactNode;
}

const initialFormData: PostFormData = {
  title: '',
  slug: '',
  author: 'Admin 1',
  content: '',
  excerpt: '',
  category: 'news',
  status: 'draft',
  publishDate: new Date().toISOString().split('T')[0],
  featuredImage: '',
  tags: [],
  allowComments: true,
};

export function PostFormDialog({ mode = 'create', postData, trigger }: PostFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [tagInput, setTagInput] = useState('');

  // Load post data when in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && postData) {
      setFormData({ ...initialFormData, ...postData });
    } else if (open && mode === 'create') {
      setFormData(initialFormData);
    }
  }, [open, mode, postData]);

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && formData.title) {
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
  }, [formData.title, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`${mode === 'create' ? 'Create' : 'Update'} post data:`, formData);
    // Reset form and close dialog
    setFormData(initialFormData);
    setTagInput('');
    setOpen(false);
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

  const defaultTrigger = mode === 'create' ? (
    <Button className="bg-[#007BFF] hover:bg-[#0056b3]">
      <Plus className="h-4 w-4 mr-2" />
      Thêm Bài Viết
    </Button>
  ) : (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm Bài Viết Mới' : 'Chỉnh Sửa Bài Viết'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Điền đầy đủ thông tin bài viết để thêm vào hệ thống'
              : 'Cập nhật thông tin bài viết'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4>Thông Tin Cơ Bản</h4>
            
            <div className="grid grid-cols-1 gap-4">
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
                  disabled={mode === 'create'}
                />
                <p className="text-xs text-gray-500">
                  {mode === 'create' ? 'Slug sẽ tự động tạo từ tiêu đề' : 'URL của bài viết'}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <h4>Nội Dung</h4>
            
            <div className="space-y-2">
              <Label htmlFor="excerpt">Tóm Tắt</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Nhập tóm tắt ngắn gọn của bài viết (hiển thị trong danh sách)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội Dung Chi Tiết *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Nhập nội dung chi tiết của bài viết"
                rows={10}
                required
              />
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-4">
            <h4>Hình Ảnh Đại Diện</h4>
            
            <div className="space-y-3">
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
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h4>Thẻ (Tags)</h4>
            
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
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h4>Cài Đặt</h4>
            
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
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
              {mode === 'create' ? 'Tạo Bài Viết' : 'Cập Nhật'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
