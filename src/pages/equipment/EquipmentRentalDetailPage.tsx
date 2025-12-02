import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign,
  Package,
  User,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { Textarea } from '../../components/ui/textarea';
import { getRental, getRentalExtensions, updateRental, approveRentalExtension, rejectRentalExtension } from '../../lib/services/equipment.service';
import { Rental, RentalStatus, RentalExtension } from '../../lib/types/rental.types';

export function EquipmentRentalDetailPage() {
  const { id } = useParams();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [extensions, setExtensions] = useState<RentalExtension[]>([]);
  const [loadingExtensions, setLoadingExtensions] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<RentalStatus | ''>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedExtension, setSelectedExtension] = useState<RentalExtension | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const loadRental = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getRental(id);
        console.log('Rental data:', data);
        setRental(data?.data || data || null);
      } catch (error: any) {
        console.error('Error loading rental:', error);
        toast.error('Không thể tải thông tin đơn thuê');
      } finally {
        setLoading(false);
      }
    };

    loadRental();
  }, [id]);

  const loadExtensions = async () => {
    if (!id) return;
    
    setLoadingExtensions(true);
    try {
      const data = await getRentalExtensions(id);
      console.log('Extensions data:', data);
      // API returns {data: {extensions: [...]}} 
      const extensionsList = data?.extensions || data?.data?.extensions || [];
      console.log('Parsed extensions list:', extensionsList);
      setExtensions(extensionsList);
    } catch (error: any) {
      console.error('Error loading extensions:', error);
      setExtensions([]); // Set empty array on error
    } finally {
      setLoadingExtensions(false);
    }
  };

  // Load extensions when rental is loaded
  useEffect(() => {
    if (rental?.id) {
      loadExtensions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rental?.id]);

  const handleApproveExtension = (extension: RentalExtension) => {
    setSelectedExtension(extension);
    setApproveDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !rental) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    if (selectedStatus === rental.status) {
      toast.error('Trạng thái mới giống trạng thái hiện tại');
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await updateRental(rental.id, { status: selectedStatus });
      toast.success('Cập nhật trạng thái thành công');
      setShowStatusSelector(false);
      setSelectedStatus('');
      
      // Reload rental data
      const data = await getRental(rental.id);
      setRental(data?.data || data || null);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmApproveExtension = async () => {
    if (!selectedExtension?.id) return;

    setActionLoading(true);
    try {
      await approveRentalExtension(selectedExtension.id);
      toast.success('Đã duyệt yêu cầu gia hạn thành công');
      
      setApproveDialogOpen(false);
      setSelectedExtension(null);
      
      // Reload extensions and rental data
      await loadExtensions();
      if (id) {
        const data = await getRental(id);
        setRental(data?.data || data || null);
      }
    } catch (error: any) {
      console.error('Error approving extension:', error);
      toast.error('Không thể duyệt yêu cầu gia hạn');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectExtension = (extension: RentalExtension) => {
    setSelectedExtension(extension);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const confirmRejectExtension = async () => {
    if (!selectedExtension?.id) return;

    setActionLoading(true);
    try {
      await rejectRentalExtension(selectedExtension.id, rejectReason);
      toast.success('Đã từ chối yêu cầu gia hạn');
      
      // Reload extensions and rental data
      await loadExtensions();
      if (id) {
        const data = await getRental(id);
        setRental(data?.data || data || null);
      }
      
      setRejectDialogOpen(false);
      setSelectedExtension(null);
      setRejectReason('');
    } catch (error: any) {
      console.error('Error rejecting extension:', error);
      toast.error('Không thể từ chối yêu cầu gia hạn');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateExtensionDays = (newEndDate: string) => {
    if (!rental?.endDate || !newEndDate) return 'N/A';
    const oldDate = new Date(rental.endDate);
    const newDate = new Date(newEndDate);
    const diffTime = newDate.getTime() - oldDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 'N/A';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/equipment-rentals">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!rental) {
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

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: RentalStatus) => {
    const statusConfig = {
      EXPIRED: { label: 'Đã Hết Hạn', className: 'bg-gray-100 text-gray-800' },
      ACTIVE: { label: 'Đang Hoạt Động', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Chờ Xử Lý', className: 'bg-yellow-100 text-yellow-800' },
      COMPLETED: { label: 'Hoàn Thành', className: 'bg-blue-100 text-blue-800' },
      CANCELLED: { label: 'Đã Hủy', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getExtensionStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Chờ Duyệt', className: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã Duyệt', className: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Đã Từ Chối', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Calculate duration in days
  const calculateDuration = () => {
    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1; // At least 1 day
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
        <div className="flex items-center gap-3">
          {getStatusBadge(rental.status)}
          <Button
            size="sm"
            onClick={() => setShowStatusSelector(!showStatusSelector)}
            className="bg-[#007BFF] hover:bg-[#0056b3]"
          >
            Cập Nhật Trạng Thái
          </Button>
        </div>
      </div>

      {/* Status Update Section */}
      {showStatusSelector && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="statusSelect">Chọn Trạng Thái Mới</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value: any) => setSelectedStatus(value)}
                >
                  <SelectTrigger id="statusSelect">
                    <SelectValue placeholder="Chọn trạng thái..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Chờ Xử Lý</SelectItem>
                    <SelectItem value="ACTIVE">Đang Hoạt Động</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
                    <SelectItem value="EXPIRED">Đã Hết Hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || !selectedStatus}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdatingStatus ? 'Đang cập nhật...' : 'Xác Nhận'}
              </Button>
              <Button
                onClick={() => {
                  setShowStatusSelector(false);
                  setSelectedStatus('');
                }}
                variant="outline"
              >
                Hủy
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Trạng thái hiện tại: <strong>{rental.status}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Card with Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chi Tiết Đơn Thuê</CardTitle>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                  {rental.id.substring(0, 8)}...
                </code>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Thông Tin</TabsTrigger>
                  <TabsTrigger value="extensions" className="flex items-center gap-2">
                    Gia Hạn ({extensions.length})
                    {extensions.filter(ext => ext.status === 'PENDING').length > 0 && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 ml-2">
                        {extensions.filter(ext => ext.status === 'PENDING').length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Người Thuê</p>
                        <p className="font-medium">{rental.userName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{rental.userId.substring(0, 8)}...</p>
                        {rental.userEmail && (
                          <p className="text-xs text-gray-500">{rental.userEmail}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Số Lượng Thiết Bị</p>
                        <p className="font-medium">{rental.totalQuantity || rental.items?.length || 0} thiết bị</p>
                        {rental.items && (
                          <p className="text-xs text-gray-500">{rental.items.length} loại</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {rental.items && rental.items.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-gray-600 mb-3 font-medium">Chi Tiết Thiết Bị</p>
                        <div className="space-y-3">
                          {rental.items.map((item, idx) => (
                            <div key={idx} className="border rounded-lg p-4 space-y-3 hover:border-blue-300 transition-colors">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="font-medium text-lg">{item.name}</p>
                                    {item.detail?.device && (
                                      <>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {item.detail.device.description}
                                        </p>
                                        {item.detail.device.information && item.detail.device.information.length > 0 && (
                                          <div className="mt-2 flex flex-wrap gap-2">
                                            {item.detail.device.information.map((info, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {info}
                                              </Badge>
                                            ))}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Số lượng</p>
                                  <p className="font-medium">x{item.quantity}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Đơn giá</p>
                                  <p className="font-medium">{formatCurrency(item.unitPrice)}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Tổng</p>
                                  <p className="font-medium text-blue-600">{formatCurrency(item.subtotal)}</p>
                                </div>
                              </div>
                              
                              {item.detail?.device?.images && item.detail.device.images.length > 0 && (
                                <>
                                  <Separator />
                                  <div>
                                    <p className="text-sm text-gray-600 mb-2">Hình ảnh</p>
                                    <div className="grid grid-cols-4 gap-2">
                                      {item.detail.device.images.map((img, i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                          <img 
                                            src={img} 
                                            alt={`${item.name} ${i + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                                            }}
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Thời Gian Bắt Đầu</p>
                        <p className="font-medium">{formatDateTime(rental.startDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Thời Gian Kết Thúc</p>
                        <p className="font-medium">{formatDateTime(rental.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Thời Lượng</p>
                      <p className="font-medium">{calculateDuration()} ngày</p>
                    </div>
                  </div>

                  {rental.actualEndDate && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3 bg-green-50 p-3 rounded-lg">
                        <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-green-700 font-medium">Ngày Trả Thực Tế</p>
                          <p className="font-medium">{formatDateTime(rental.actualEndDate)}</p>
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Ngày Tạo Đơn</p>
                    <p className="font-medium">{formatDateTime(rental.createdAt)}</p>
                  </div>

                  {rental.reviewId && (
                    <>
                      <Separator />
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium">Đã có đánh giá</p>
                        <p className="text-xs text-blue-600 mt-1">Review ID: {rental.reviewId.substring(0, 8)}...</p>
                      </div>
                    </>
                  )}
                </div>
        </TabsContent>

        {/* Extensions Tab */}
        <TabsContent value="extensions">
          {loadingExtensions ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Đang tải danh sách gia hạn...</p>
                </div>
              ) : extensions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Chưa có yêu cầu gia hạn nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {extensions.map((extension) => (
                    <div key={extension.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Gia hạn #{extension.id.substring(0, 8)}...</h4>
                          {getExtensionStatusBadge(extension.status)}
                        </div>
                        {extension.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApproveExtension(extension)}
                              disabled={actionLoading}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectExtension(extension)}
                              disabled={actionLoading}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ Chối
                            </Button>
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Ngày kết thúc mới</p>
                          <p className="font-medium">{formatDateTime(extension.newEndDate)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Số ngày gia hạn</p>
                          <p className="font-medium">
                            {calculateExtensionDays(extension.newEndDate)} ngày
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Ngày yêu cầu</p>
                          <p className="font-medium">{formatDateTime(extension.createdAt)}</p>
                        </div>
                      </div>

                      {extension.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                          <p className="text-sm text-blue-800 font-medium">Ghi chú:</p>
                          <p className="text-sm text-blue-700 mt-1">{extension.notes}</p>
                        </div>
                      )}

                      {extension.requestedBy && (
                        <div className="text-sm">
                          <p className="text-gray-600">Người yêu cầu</p>
                          <p className="font-medium">{extension.requestedBy}</p>
                        </div>
                      )}

                      {extension.status === 'REJECTED' && extension.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-sm text-red-800 font-medium">Lý do từ chối:</p>
                          <p className="text-sm text-red-700 mt-1">{extension.rejectionReason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
        </TabsContent>
          </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Chi Phí */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Chi Phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rental.rentalFee !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phí Thuê</span>
                  <span className="font-medium">{formatCurrency(rental.rentalFee)}</span>
                </div>
              )}

              {rental.deposit !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tiền Cọc</span>
                  <span className="font-medium">{formatCurrency(rental.deposit)}</span>
                </div>
              )}

              {rental.discountPercent && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm Giá</span>
                  <span className="font-medium text-green-600">{rental.discountPercent}%</span>
                </div>
              )}

              {rental.maxDiscount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm Tối Đa</span>
                  <span className="font-medium">{formatCurrency(rental.maxDiscount)}</span>
                </div>
              )}

              {rental.totalPrice !== undefined && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Tổng Tiền</span>
                    <span className="text-xl font-bold text-[#007BFF]">
                      {formatCurrency(rental.totalPrice)}
                    </span>
                  </div>
                </>
              )}

              {!rental.rentalFee && !rental.deposit && !rental.totalPrice && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Chưa có thông tin chi phí
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Extension Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác Nhận Duyệt Yêu Cầu Gia Hạn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn duyệt yêu cầu gia hạn <strong>#{selectedExtension?.id.substring(0, 8)}...</strong>?
              <br /><br />
              Ngày kết thúc mới: <strong>{selectedExtension?.newEndDate ? formatDateTime(selectedExtension.newEndDate) : 'N/A'}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmApproveExtension}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 focus:ring-green-600"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang duyệt...
                </>
              ) : (
                'Duyệt'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Extension Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Từ Chối Yêu Cầu Gia Hạn</AlertDialogTitle>
            <AlertDialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu gia hạn <strong>#{selectedExtension?.id.substring(0, 8)}...</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Nhập lý do từ chối..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={actionLoading}
              onClick={() => {
                setRejectDialogOpen(false);
                setSelectedExtension(null);
                setRejectReason('');
              }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRejectExtension}
              disabled={!rejectReason.trim() || actionLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang từ chối...
                </>
              ) : (
                'Từ Chối'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
