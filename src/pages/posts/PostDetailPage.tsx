import { ArrowLeft, Calendar, Eye, MessageSquare, Tag, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { mockPosts, Post } from '../../lib/mockData';

export function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    if (id) {
      const foundPost = mockPosts.find((p) => p.id === parseInt(id));
      setPost(foundPost || null);
    }
  }, [id]);

  if (!post) {
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
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/posts')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay Lại Danh Sách
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getCategoryColor(post.category)}>
                    {getCategoryLabel(post.category)}
                  </Badge>
                  <Badge className={getStatusColor(post.status)}>
                    {getStatusLabel(post.status)}
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{post.title}</CardTitle>
                
                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.publishDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatNumber(post.viewCount)} lượt xem</span>
                  </div>
                  {post.allowComments && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>Cho phép bình luận</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Featured Image */}
              {post.featuredImage && (
                <div className="w-full">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/800x400';
                    }}
                  />
                </div>
              )}

              {/* Excerpt */}
              {post.excerpt && (
                <div className="bg-blue-50 border-l-4 border-[#007BFF] p-4 rounded">
                  <p className="text-gray-700 italic">{post.excerpt}</p>
                </div>
              )}

              <Separator />

              {/* Content */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {post.content}
                </div>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Tag className="h-4 w-4" />
                      <span>Thẻ:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="bg-gray-50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Bài Viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">ID</div>
                <div className="text-sm">{post.id}</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Khu Vực</div>
                <div className="text-sm">{post.region}</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Slug (URL)</div>
                <div className="text-sm break-all font-mono bg-gray-50 p-2 rounded">
                  {post.slug}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Tác Giả</div>
                <div className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {post.author}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Danh Mục</div>
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryLabel(post.category)}
                </Badge>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Trạng Thái</div>
                <Badge className={getStatusColor(post.status)}>
                  {getStatusLabel(post.status)}
                </Badge>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Ngày Xuất Bản</div>
                <div className="text-sm">{formatDate(post.publishDate)}</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Ngày Cập Nhật</div>
                <div className="text-sm">{formatDate(post.updatedDate)}</div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Lượt Xem</div>
                <div className="text-sm flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {formatNumber(post.viewCount)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Bình Luận</div>
                <div className="text-sm">
                  {post.allowComments ? (
                    <span className="text-green-600">✓ Cho phép</span>
                  ) : (
                    <span className="text-red-600">✗ Không cho phép</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Thống Kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Lượt xem</span>
                <span className="text-sm">{formatNumber(post.viewCount)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Số thẻ</span>
                <span className="text-sm">{post.tags.length}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Độ dài nội dung</span>
                <span className="text-sm">{post.content.length} ký tự</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
