import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { mockCombos, mockEquipment } from '../../lib/mockData';

export function ComboDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const combo = mockCombos.find((c) => c.id === Number(id));

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
            </CardContent>
          </Card>

          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle>Thiết Bị Trong Combo ({combo.devices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thiết Bị</TableHead>
                    <TableHead>Danh Mục</TableHead>
                    <TableHead>Số Lượng</TableHead>
                    <TableHead className="text-right">Giá/Ngày</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combo.devices.map((device) => {
                    const equipment = mockEquipment.find((e) => e.id === device.deviceId);
                    return (
                      <TableRow key={device.id}>
                        <TableCell>{device.deviceName}</TableCell>
                        <TableCell>{equipment?.category || '-'}</TableCell>
                        <TableCell>{device.quantity}x</TableCell>
                        <TableCell className="text-right">
                          {equipment ? formatCurrency(equipment.price) : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Tổng giá riêng lẻ (ước tính):
                  </span>
                  <span className="text-sm">
                    {formatCurrency(
                      combo.devices.reduce((sum, device) => {
                        const equipment = mockEquipment.find((e) => e.id === device.deviceId);
                        return sum + (equipment ? equipment.price * device.quantity : 0);
                      }, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span>Giá combo:</span>
                  <span className="text-lg text-[#007BFF]">{formatCurrency(combo.price)}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-green-600">
                  <span>Tiết kiệm:</span>
                  <span>
                    {formatCurrency(
                      combo.devices.reduce((sum, device) => {
                        const equipment = mockEquipment.find((e) => e.id === device.deviceId);
                        return sum + (equipment ? equipment.price * device.quantity : 0);
                      }, 0) - combo.price
                    )}
                  </span>
                </div>
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
                <div className="text-sm">{combo.id}</div>
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
