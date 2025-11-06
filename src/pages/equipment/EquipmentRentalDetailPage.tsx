import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  History, 
  Image as ImageIcon,
  MapPin, 
  Package,
  User, 
  Wrench,
  XCircle 
} from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  EquipmentBookingStatus,
  mockEquipmentBookingExtensions,
  mockEquipmentBookingHistory,
  mockEquipmentBookings,
  mockEquipmentCheckInOuts,
} from '../../lib/mockData';

export function EquipmentRentalDetailPage() {
  const { id } = useParams();
  const booking = mockEquipmentBookings.find((b) => b.id === id);
  const [activeTab, setActiveTab] = useState('details');

  if (!booking) {
    return (
      <div className="space-y-6">
        <Link to="/equipment-rentals">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy đơn thuê</p>
        </div>
      </div>
    );
  }

  // Get related data
  const history = mockEquipmentBookingHistory.filter((h) => h.bookingId === booking.id);
  const checkIns = mockEquipmentCheckInOuts.filter((c) => c.bookingId === booking.id);
  const extensions = mockEquipmentBookingExtensions.filter((e) => e.bookingId === booking.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: EquipmentBookingStatus) => {
    const statusConfig = {
      PENDING: { label: 'Chờ Thanh Toán', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: 'Đã Xác Nhận', className: 'bg-blue-100 text-blue-800' },
      READY_FOR_PICKUP: { label: 'Sẵn Sàng Nhận', className: 'bg-cyan-100 text-cyan-800' },
      ONGOING: { label: 'Đang Thuê', className: 'bg-purple-100 text-purple-800' },
      COMPLETED: { label: 'Hoàn Thành', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Đã Hủy', className: 'bg-red-100 text-red-800' },
      OVERDUE: { label: 'Quá Hạn', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getExtensionStatusBadge = (status: string) => {
    const config = {
      PENDING: { label: 'Chờ Duyệt', className: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã Duyệt', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Từ Chối', className: 'bg-red-100 text-red-800' },
    };
    return <Badge className={config[status as keyof typeof config].className}>
      {config[status as keyof typeof config].label}
    </Badge>;
  };

  const getHistoryActionLabel = (action: string) => {
    const labels = {
      CREATED: 'Tạo đơn thuê',
      DEPOSIT_PAID: 'Thanh toán',
      FULLY_PAID: 'Thanh toán đầy đủ',
      CHECKED_IN: 'Nhận thiết bị',
      CHECKED_OUT: 'Trả thiết bị',
      CANCELLED: 'Hủy đơn',
      REFUNDED: 'Hoàn tiền',
      EXTENSION_REQUESTED: 'Yêu cầu gia hạn',
      EXTENSION_APPROVED: 'Duyệt gia hạn',
    };
    return labels[action as keyof typeof labels] || action;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/equipment-rentals">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {getStatusBadge(booking.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chi Tiết Đơn Thuê</CardTitle>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">{booking.id}</code>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Thông Tin</TabsTrigger>
                  <TabsTrigger value="history">
                    Lịch Sử ({history.length})
                  </TabsTrigger>
                  <TabsTrigger value="checkins">
                    Nhận/Trả ({checkIns.length})
                  </TabsTrigger>
                  <TabsTrigger value="extensions">
                    Gia Hạn ({extensions.length})
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Người Thuê</p>
                        <p className="font-medium">{booking.userName}</p>
                        <p className="text-xs text-gray-500">{booking.userId}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Số Lượng Thiết Bị</p>
                        <p className="font-medium">{booking.items.length} mục</p>
                        <p className="text-xs text-gray-500">
                          {booking.items.filter(i => i.type === 'combo').length} combo, {booking.items.filter(i => i.type === 'equipment').length} thiết bị
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-600 mb-3">Chi Tiết Thiết Bị</p>
                    <div className="space-y-2">
                      {booking.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            {item.type === 'combo' ? (
                              <Package className="h-5 w-5 text-purple-600" />
                            ) : (
                              <Wrench className="h-5 w-5 text-blue-600" />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {formatCurrency(item.pricePerDay)}/ngày × {item.quantity} × {booking.duration} ngày
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">{formatCurrency(item.totalPrice)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Thời Gian Bắt Đầu</p>
                        <p className="font-medium">{formatDateTime(booking.startTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Thời Gian Kết Thúc</p>
                        <p className="font-medium">{formatDateTime(booking.endTime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Thời Lượng</p>
                      <p className="font-medium">{booking.duration} ngày</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Địa Chỉ Giao Hàng</p>
                      <p className="font-medium">{booking.deliveryAddress}</p>
                      <p className="text-xs text-gray-500">
                        {booking.deliveryLat.toFixed(6)}, {booking.deliveryLng.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Ghi Chú Khách Hàng</p>
                          <p className="text-sm mt-1">{booking.notes}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {booking.adminNotes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-700 font-medium">Ghi Chú Admin</p>
                          <p className="text-sm mt-1">{booking.adminNotes}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {booking.cancelReason && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-700 font-medium">Lý Do Hủy</p>
                          <p className="text-sm mt-1">{booking.cancelReason}</p>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-3 mt-4">
                  {history.length > 0 ? (
                    history.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <History className="h-4 w-4 text-blue-600" />
                          </div>
                          {index < history.length - 1 && (
                            <div className="absolute top-8 left-4 w-px h-8 bg-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{getHistoryActionLabel(item.action)}</p>
                          {item.notes && <p className="text-sm text-gray-600 mt-1">{item.notes}</p>}
                          <p className="text-xs text-gray-500 mt-1">{formatDateTime(item.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Chưa có lịch sử</p>
                  )}
                </TabsContent>

                {/* Check-ins Tab */}
                <TabsContent value="checkins" className="space-y-4 mt-4">
                  {checkIns.length > 0 ? (
                    checkIns.map((checkIn) => (
                      <div key={checkIn.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge className={checkIn.type === 'CHECK_IN' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {checkIn.type === 'CHECK_IN' ? 'Nhận Thiết Bị' : 'Trả Thiết Bị'}
                            </Badge>
                            {checkIn.verified && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã Xác Nhận
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{formatDateTime(checkIn.createdAt)}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-600">Người Thực Hiện</p>
                          <p className="font-medium">{checkIn.userName}</p>
                        </div>

                        {checkIn.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-600">Ghi Chú</p>
                            <p className="text-sm mt-1">{checkIn.notes}</p>
                          </div>
                        )}

                        {checkIn.damageNotes && (
                          <div className="bg-red-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-red-700 font-medium">Ghi Chú Hư Hỏng</p>
                            <p className="text-sm mt-1">{checkIn.damageNotes}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Hình Ảnh ({checkIn.images.length})</p>
                          <div className="grid grid-cols-4 gap-2">
                            {checkIn.images.map((img, idx) => (
                              <div key={idx} className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {checkIn.damageImages.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-red-600 font-medium mb-2">Hình Ảnh Hư Hỏng</p>
                            <div className="grid grid-cols-4 gap-2">
                              {checkIn.damageImages.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-red-50 rounded flex items-center justify-center border border-red-200">
                                  <ImageIcon className="h-6 w-6 text-red-400" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Chưa có thông tin nhận/trả</p>
                  )}
                </TabsContent>

                {/* Extensions Tab */}
                <TabsContent value="extensions" className="space-y-3 mt-4">
                  {extensions.length > 0 ? (
                    extensions.map((ext) => (
                      <div key={ext.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">Yêu Cầu Gia Hạn</span>
                          </div>
                          {getExtensionStatusBadge(ext.status)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Thời Gian Cũ</p>
                            <p className="font-medium">{formatDateTime(ext.originalEndTime)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Thời Gian Mới</p>
                            <p className="font-medium text-green-600">{formatDateTime(ext.newEndTime)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Thời Gian Thêm</p>
                            <p className="font-medium">+{ext.additionalDays} ngày</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phí Thêm</p>
                            <p className="font-medium text-blue-600">{formatCurrency(ext.additionalAmount)}</p>
                          </div>
                        </div>

                        {ext.notes && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-gray-600">Ghi Chú</p>
                            <p className="text-sm mt-1">{ext.notes}</p>
                          </div>
                        )}

                        {ext.rejectionReason && (
                          <div className="bg-red-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-red-700 font-medium">Lý Do Từ Chối</p>
                            <p className="text-sm mt-1">{ext.rejectionReason}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <p>Yêu cầu bởi: {ext.requestedByName}</p>
                          <p>{formatDateTime(ext.createdAt)}</p>
                        </div>

                        {ext.status === 'PENDING' && (
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Duyệt
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-2" />
                              Từ Chối
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Chưa có yêu cầu gia hạn</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Chi Phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tổng thiết bị</span>
                <span className="font-medium">{formatCurrency(booking.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phí giao hàng</span>
                <span className="font-medium">{formatCurrency(booking.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (10%)</span>
                <span className="font-medium">{formatCurrency(booking.vat)}</span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-medium text-green-600">-{formatCurrency(booking.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tiền cọc</span>
                <span className="font-medium">{formatCurrency(booking.deposit)}</span>
              </div>

              {(booking.penaltyAmount > 0 || booking.damageAmount > 0 || booking.overtimeAmount > 0) && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-red-600">Các khoản phí phạt:</p>
                  {booking.penaltyAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí phạt</span>
                      <span className="font-medium text-red-600">{formatCurrency(booking.penaltyAmount)}</span>
                    </div>
                  )}
                  {booking.damageAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí hư hỏng</span>
                      <span className="font-medium text-red-600">{formatCurrency(booking.damageAmount)}</span>
                    </div>
                  )}
                  {booking.overtimeAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí quá hạn</span>
                      <span className="font-medium text-red-600">{formatCurrency(booking.overtimeAmount)}</span>
                    </div>
                  )}
                </>
              )}

              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Tổng Cộng</span>
                <span className="text-xl font-bold text-[#007BFF]">{formatCurrency(booking.totalAmount)}</span>
              </div>

              {booking.refundAmount > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between bg-green-50 p-3 rounded-lg">
                    <span className="font-medium text-green-700">Hoàn Lại</span>
                    <span className="font-bold text-green-700">{formatCurrency(booking.refundAmount)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Thanh Toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Trạng Thái</p>
                <Badge className={
                  booking.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                  booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  booking.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {booking.paymentStatus === 'PAID' ? 'Đã Thanh Toán' :
                   booking.paymentStatus === 'PENDING' ? 'Chờ Thanh Toán' :
                   booking.paymentStatus === 'FAILED' ? 'Thất Bại' :
                   'Đã Hoàn Tiền'}
                </Badge>
              </div>
              {booking.paidAt && (
                <div>
                  <p className="text-sm text-gray-600">Ngày Thanh Toán</p>
                  <p className="font-medium">{formatDateTime(booking.paidAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Hệ Thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Ngày tạo</p>
                <p className="font-medium">{formatDateTime(booking.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-600">Cập nhật lần cuối</p>
                <p className="font-medium">{formatDateTime(booking.updatedAt)}</p>
              </div>
              {booking.cancelledAt && (
                <div>
                  <p className="text-gray-600">Ngày hủy</p>
                  <p className="font-medium text-red-600">{formatDateTime(booking.cancelledAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
