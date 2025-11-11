import { ArrowLeft, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import * as blogService from '../../lib/services/blog.service';
import type { Blog } from '../../lib/types/blog.types';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBlog = async () => {
      if (!id) {
        navigate('/posts');
        return;
      }

      try {
        setIsLoading(true);
        const data = await blogService.getBlog(id);
        setBlog(data);
      } catch (error) {
        console.error('Error loading blog:', error);
        toast.error('Không thể tải thông tin bài viết');
        navigate('/posts');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlog();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-lg">Đang tải...</div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/posts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Không tìm thấy bài viết</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getCategoryColor = (type: string) => {
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
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/posts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay Lại Danh Sách
        </Button>
        <Button onClick={() => navigate(`/posts/${id}/edit`)}>
          Chỉnh Sửa
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blog Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(blog.type)}>
                    {blog.type}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{blog.title}</CardTitle>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(blog.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Featured Image */}
              {blog.thumbnail && (
                <div className="w-full">
                  <img
                    src={blog.thumbnail}
                    alt={blog.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x400';
                    }}
                  />
                </div>
              )}

              {/* Summary */}
              {blog.summary && (
                <div className="bg-blue-50 border-l-4 border-[#007BFF] p-4 rounded">
                  <p className="text-gray-700 italic">{blog.summary}</p>
                </div>
              )}

              <Separator />

              {/* Content */}
              <div className="prose max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.content || '' }}
                />
              </div>

              {/* Tag */}
              {blog.tag && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Tag:</span>
                    </div>
                    <Badge variant="outline" className="bg-gray-50">
                      {blog.tag}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Blog Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Bài Viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">ID</div>
                <div className="text-sm font-mono text-xs break-all">{blog.id}</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Khu Vực</div>
                <div className="text-sm">{blog.region}</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Loại</div>
                <Badge className={getCategoryColor(blog.type)}>
                  {blog.type}
                </Badge>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Ngày Tạo</div>
                <div className="text-sm">{formatDate(blog.createdAt)}</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Ngày Cập Nhật</div>
                <div className="text-sm">{formatDate(blog.updatedAt)}</div>
              </div>
              
              {blog.tag && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Tag</div>
                    <div className="text-sm">{blog.tag}</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống Kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Độ dài nội dung</span>
                <span className="text-sm">{blog.content?.length || 0} ký tự</span>
              </div>
              {blog.summary && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Độ dài tóm tắt</span>
                    <span className="text-sm">{blog.summary.length} ký tự</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
