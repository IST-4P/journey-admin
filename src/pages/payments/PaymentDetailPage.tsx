import { ArrowLeft, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import * as paymentService from '../../lib/services/payment.service';
import type { Payment, PaymentStatus, PaymentType } from '../../lib/types/payment.types';

export function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPayment = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const data = await paymentService.getPayment(id);
        setPayment(data);
      } catch (error: any) {
        console.error('Error loading payment:', error);
        toast.error('Không thể tải thông tin thanh toán');
        navigate('/payments');
      } finally {
        setIsLoading(false);
      }
    };

    loadPayment();
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

  if (!payment) {
    return (
      <div className="space-y-6">
        <Link to="/payments">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thanh toán</p>
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

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig = {
      PAID: { label: 'Đã Thanh Toán', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Chờ Thanh Toán', className: 'bg-yellow-100 text-yellow-800' },
      FAILED: { label: 'Thất Bại', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeBadge = (type: PaymentType) => {
    const typeConfig: Record<PaymentType, { label: string; className: string }> = {
      VEHICLE: { label: 'Phương Tiện', className: 'bg-blue-100 text-blue-800' },
      DEVICE: { label: 'Thiết Bị', className: 'bg-purple-100 text-purple-800' },
      EXTENSION: { label: 'Gia Hạn', className: 'bg-green-100 text-green-800' },
    };
    const config = typeConfig[type];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleDownloadInvoice = () => {
    console.log('Downloading invoice for payment:', payment.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/payments">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </Link>
        <Button onClick={handleDownloadInvoice} className="bg-[#007BFF] hover:bg-[#0056b3]">
          <Download className="h-4 w-4 mr-2" />
          Tải Hóa Đơn
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Thanh Toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mã Thanh Toán</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {payment.paymentCode}
                  </code>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số Thứ Tự</p>
                  <p className="font-medium">#{payment.sequenceNumber}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Loại Thanh Toán</p>
                  <div>{getTypeBadge(payment.type)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trạng Thái</p>
                  <div>{getStatusBadge(payment.status)}</div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">User ID</p>
                  <p className="text-xs text-gray-500 break-all">{payment.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    {payment.type === 'VEHICLE' ? 'Booking ID' : 'Booking ID'}
                  </p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded break-all">
                    {payment.bookingId}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lịch Sử Thanh Toán</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Tạo thanh toán</p>
                    <p className="text-sm text-gray-600">{formatDate(payment.createdAt)}</p>
                  </div>
                  <Badge>Tạo mới</Badge>
                </div>
                {payment.status === 'PAID' && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">Thanh toán thành công</p>
                      <p className="text-sm text-gray-600">{formatDate(payment.updatedAt)}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
                  </div>
                )}
                {payment.status === 'FAILED' && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium">Thanh toán thất bại</p>
                      <p className="text-sm text-gray-600">{formatDate(payment.updatedAt)}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Thất bại</Badge>
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
              <CardTitle>Tổng Quan Số Tiền</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng Số Tiền</p>
                <p className="text-2xl font-bold text-[#007BFF]">{formatCurrency(payment.amount)}</p>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span className="font-medium">{formatDate(payment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật lần cuối</span>
                  <span className="font-medium">{formatDate(payment.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {payment.status === 'PENDING' && (
            <Card>
              <CardHeader>
                <CardTitle>Thao Tác</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Xác Nhận Thanh Toán
                </Button>
                <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                  Hủy Thanh Toán
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
