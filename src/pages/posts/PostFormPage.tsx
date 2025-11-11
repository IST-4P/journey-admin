import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import * as blogService from '../../lib/services/blog.service';
import * as mediaService from '../../lib/services/media.service';
import type { CreateBlogRequest, UpdateBlogRequest } from '../../lib/types/blog.types';

const REGIONS = ['TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'];

// Hàm chuyển đổi text sang HTML
const convertTextToHtml = (text: string): string => {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `<p>${line}</p>`)
    .join('\n');
};

// Hàm chuyển đổi HTML về text
const convertHtmlToText = (html: string): string => {
  // Tạo một div tạm để parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Lấy text content và giữ nguyên line breaks
  const text = tempDiv.innerHTML
    .replace(/<\/p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // Loại bỏ các thẻ HTML còn lại
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
  
  return text;
};

interface PostFormData {
  title: string;
  content: string;
  type: string;
  region: string;
  thumbnail: string;
  tag: string;
  summary: string;
}

const initialFormData: PostFormData = {
  title: '',
  content: '',
  type: '',
  region: '',
  thumbnail: '',
  tag: '',
  summary: '',
};

export function PostFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';
  
  const [formData, setFormData] = useState<PostFormData>(initialFormData);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load blog data when editing
  useEffect(() => {
    const loadBlog = async () => {
      if (!isNew && id) {
        try {
          setIsLoading(true);
          const blog = await blogService.getBlog(id);
          setFormData({
            title: blog.title,
            content: convertHtmlToText(blog.content || ''), // Chuyển HTML về text
            type: blog.type,
            region: blog.region,
            thumbnail: blog.thumbnail,
            tag: blog.tag || '',
            summary: blog.summary || '',
          });
        } catch (error) {
          console.error('Error loading blog:', error);
          toast.error('Không thể tải thông tin bài viết');
          navigate('/posts');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadBlog();
  }, [id, isNew, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('Vui lòng nhập nội dung');
      return;
    }
    if (!formData.type.trim()) {
      toast.error('Vui lòng nhập loại bài viết');
      return;
    }
    if (!formData.region.trim()) {
      toast.error('Vui lòng chọn khu vực');
      return;
    }
    if (!formData.thumbnail.trim()) {
      toast.error('Vui lòng upload hình ảnh đại diện');
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuyển đổi nội dung text sang HTML
      const htmlContent = convertTextToHtml(formData.content);
      
      if (isNew) {
        // Create new blog
        const createData: CreateBlogRequest = {
          title: formData.title,
          content: htmlContent,
          type: formData.type,
          region: formData.region,
          thumbnail: formData.thumbnail,
          tag: formData.tag || undefined,
          summary: formData.summary || undefined,
        };
        await blogService.createBlog(createData);
        toast.success('Tạo bài viết thành công');
      } else {
        // Update existing blog
        const updateData: UpdateBlogRequest = {
          title: formData.title,
          content: htmlContent,
          type: formData.type,
          region: formData.region,
          thumbnail: formData.thumbnail,
          tag: formData.tag || undefined,
          summary: formData.summary || undefined,
        };
        await blogService.updateBlog(id!, updateData);
        toast.success('Cập nhật bài viết thành công');
      }
      navigate('/posts');
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast.error(error.message || 'Không thể lưu bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);

    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File không phải là ảnh");
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File vượt quá 5MB");
      }

      // Upload and get URL
      const url = await mediaService.uploadImage(file);
      setFormData({ ...formData, thumbnail: url });
      toast.success("Đã upload ảnh thành công");

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Không thể upload ảnh");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddFeaturedImage = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

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
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Loại Bài Viết *</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Ví dụ: ABC, DEF"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Khu Vực *</Label>
                <Select
                  value={formData.region}
                  onValueChange={(value: string) => setFormData({ ...formData, region: value })}
                  disabled={isSubmitting}
                  required
                >
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Chọn khu vực" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag">Tag</Label>
              <Input
                id="tag"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                placeholder="Ví dụ: ABC, XYZ"
                disabled={isSubmitting}
              />
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
              <Label htmlFor="summary">Tóm Tắt</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                placeholder="Nhập tóm tắt ngắn gọn của bài viết"
                rows={3}
                disabled={isSubmitting}
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
                placeholder="Nhập nội dung chi tiết của bài viết. Nội dung sẽ được tự động chuyển sang HTML khi lưu."
                rows={15}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500">
                Mỗi dòng sẽ được chuyển thành một đoạn văn HTML khi lưu
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Featured Image */}
        <Card>
          <CardHeader>
            <CardTitle>Hình Ảnh Đại Diện *</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button 
              type="button" 
              onClick={handleAddFeaturedImage} 
              variant="outline"
              disabled={isUploadingImage || isSubmitting}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploadingImage 
                ? 'Đang Upload...' 
                : formData.thumbnail 
                  ? 'Thay Đổi Hình Ảnh' 
                  : 'Thêm Hình Ảnh'}
            </Button>

            {formData.thumbnail && (
              <div className="relative inline-block">
                <img
                  src={formData.thumbnail}
                  alt="Featured"
                  className="w-full max-w-md h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x200';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, thumbnail: '' })}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/posts')}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            className="bg-[#007BFF] hover:bg-[#0056b3]"
            disabled={isSubmitting || isUploadingImage}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting 
              ? 'Đang xử lý...' 
              : isNew 
                ? 'Tạo Bài Viết' 
                : 'Cập Nhật'}
          </Button>
        </div>
      </form>
    </div>
  );
}
