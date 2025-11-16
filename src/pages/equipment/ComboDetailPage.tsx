import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { getCombo } from '../../lib/services/equipment.service';
import { Combo } from '../../lib/types';
import { toast } from 'sonner';

export function ComboDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [combo, setCombo] = useState<Combo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCombo();
    }
  }, [id]);

  const fetchCombo = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getCombo(id);
      console.log('Combo detail response:', response);
      setCombo(response);
    } catch (error) {
      console.error('Error fetching combo:', error);
      toast.error('Không thể tải thông tin combo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!combo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">Combo Không Tồn Tại</h2>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/equipment')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">Chi Tiết Combo</h2>
        </div>
        <Button
          onClick={() => navigate(`/equipment/combos/${id}/edit`)}
          className="bg-[#007BFF] hover:bg-[#0056b3]"
        >
          Chỉnh Sửa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {combo.images && combo.images.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {combo.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Combo ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x200';
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Cơ Bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Tên Combo</div>
                <div className="text-lg">{combo.name}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600 mb-1">Giá/Ngày</div>
                <div className="text-lg text-[#007BFF]">{formatCurrency(combo.price)}</div>
              </div>

              {combo.description && (
                <>
                  <Separator />
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Mô Tả</div>
                    <div className="text-sm">{combo.description}</div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <div className="text-sm text-gray-600 mb-1">Số Thiết Bị</div>
                <div className="text-lg">{combo.deviceCount || 0}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">ID</div>
                <div className="text-sm font-mono">{combo.id}</div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600 mb-1">Ngày Tạo</div>
                <div className="text-sm">
                  {new Date(combo.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>

              <Separator />

              <div>
                <div className="text-sm text-gray-600 mb-1">Ngày Cập Nhật</div>
                <div className="text-sm">
                  {new Date(combo.updatedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
