import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import * as refundService from '../../lib/services/refund.service';
import type { Refund, RefundStatus } from '../../lib/types/refund.types';

export function RefundDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refund, setRefund] = useState<Refund | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRefund = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await refundService.getRefund(id);
        setRefund(data);
      } catch (error: any) {
        console.error('Error loading refund:', error);
        toast.error('Không thể tải thông tin hoàn tiền');
        navigate('/refunds');
      } finally {
        setIsLoading(false);
      }
    };

    loadRefund();
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

  if (!refund) {
    return (
      <div className="space-y-6">
        <Link to="/refunds">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy yêu cầu hoàn tiền</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (status: RefundStatus) => {
    const statusConfig = {
      COMPLETED: { label: 'Đã Hoàn Tiền', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Đang Xử Lý', className: 'bg-yellow-100 text-yellow-800' },
      CANCELLED: { label: 'Đã Hủy', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const totalDeductions = refund.penaltyAmount + refund.damageAmount + refund.overtimeAmount;
  const finalAmount = refund.amount - totalDeductions;

  return (
    <div className="space-y-6">
      <Link to="/refunds">
        <Button variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay Lại
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Hoàn Tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mã Yêu Cầu</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">{refund.id}</code>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trạng Thái</p>
                  <div>{getStatusBadge(refund.status)}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                    {refund.bookingId}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">User ID</p>
                  <p className="text-xs text-gray-500 break-all">{refund.userId}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-gray-600 mb-1">Số Tiền Gốc (Principal)</p>
                <p className="font-medium">{formatCurrency(refund.principal)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chi Tiết Số Tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">Số tiền gốc hoàn lại</span>
                <span className="text-lg font-bold text-blue-700">{formatCurrency(refund.amount)}</span>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 mb-2">Các khoản phí trừ:</p>
                
                {refund.penaltyAmount > 0 && (
                  <div className="flex justify-between items-center px-3 py-2 bg-red-50 rounded">
                    <span className="text-sm">Phí phạt</span>
                    <span className="text-red-600 font-medium">-{formatCurrency(refund.penaltyAmount)}</span>
                  </div>
                )}

                {refund.damageAmount > 0 && (
                  <div className="flex justify-between items-center px-3 py-2 bg-red-50 rounded">
                    <span className="text-sm">Phí thiệt hại</span>
                    <span className="text-red-600 font-medium">-{formatCurrency(refund.damageAmount)}</span>
                  </div>
                )}

                {refund.overtimeAmount > 0 && (
                  <div className="flex justify-between items-center px-3 py-2 bg-red-50 rounded">
                    <span className="text-sm">Phí quá hạn</span>
                    <span className="text-red-600 font-medium">-{formatCurrency(refund.overtimeAmount)}</span>
                  </div>
                )}

                {totalDeductions === 0 && (
                  <p className="text-sm text-gray-500 px-3 py-2">Không có khoản phí trừ nào</p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <span className="text-lg font-bold">Số tiền thực nhận</span>
                <span className="text-2xl font-bold text-green-700">
                  {formatCurrency(finalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch Sử Xử Lý</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Tạo yêu cầu hoàn tiền</p>
                    <p className="text-sm text-gray-600">{formatDate(refund.createdAt)}</p>
                  </div>
                  <Badge>Tạo mới</Badge>
                </div>
                {refund.status === 'COMPLETED' && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Hoàn tiền thành công</p>
                      <p className="text-sm text-gray-600">{formatDate(refund.updatedAt)}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
                  </div>
                )}
                {refund.status === 'CANCELLED' && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">Yêu cầu đã bị hủy</p>
                      <p className="text-sm text-gray-600">{formatDate(refund.updatedAt)}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng Quan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span className="font-medium">{formatDate(refund.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật lần cuối</span>
                  <span className="font-medium">{formatDate(refund.updatedAt)}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tổng phí trừ</span>
                  <span className="font-medium text-red-600">
                    {totalDeductions > 0 ? formatCurrency(totalDeductions) : '0 ₫'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tỷ lệ hoàn lại</span>
                  <span className="font-bold text-blue-600">
                    {((finalAmount / refund.amount) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {refund.status === 'PENDING' && (
            <Card>
              <CardHeader>
                <CardTitle>Thao Tác</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Xác Nhận Hoàn Tiền
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                  <XCircle className="h-4 w-4 mr-2" />
                  Từ Chối Yêu Cầu
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
