import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  History,
  MapPin,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import * as bookingService from "../../lib/services/booking.service";
import type {
  Booking,
  BookingHistory,
  BookingStatus,
  CheckInOut,
  Extension,
} from "../../lib/types/booking.types";

export function RentalDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [checkInOuts, setCheckInOuts] = useState<CheckInOut[]>([]);
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [history, setHistory] = useState<BookingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [showStatusSelector, setShowStatusSelector] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "">("");

  useEffect(() => {
    if (id) {
      loadBookingData();
    }
  }, [id]);

  const loadBookingData = async () => {
    try {
      setIsLoading(true);
      const [bookingData, checkInOutData, extensionData, historyData] =
        await Promise.all([
          bookingService.getBookingById(id!),
          bookingService.getCheckInOutsByBookingId(id!).catch(() => []),
          bookingService.getExtensionsByBookingId(id!).catch(() => []),
          bookingService.getBookingHistory(id!).catch(() => []),
        ]);

      setBooking(bookingData);
      setCheckInOuts(Array.isArray(checkInOutData) ? checkInOutData : []);
      setExtensions(Array.isArray(extensionData) ? extensionData : []);
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (error: any) {
      console.error("Error loading booking:", error);
      toast.error("Không thể tải thông tin đơn thuê");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusConfig = {
      PENDING: {
        label: "Chờ Thanh Toán",
        className: "bg-yellow-100 text-yellow-800",
      },
      DEPOSIT_PAID: { label: "Đã Cọc", className: "bg-blue-100 text-blue-800" },
      FULLY_PAID: {
        label: "Đã Thanh Toán",
        className: "bg-green-100 text-green-800",
      },
      ONGOING: {
        label: "Đang Thuê",
        className: "bg-purple-100 text-purple-800",
      },
      COMPLETED: {
        label: "Hoàn Thành",
        className: "bg-gray-100 text-gray-800",
      },
      CANCELLED: { label: "Đã Hủy", className: "bg-red-100 text-red-800" },
      EXPIRED: { label: "Hết Hạn", className: "bg-orange-100 text-orange-800" },
      OVERDUE: { label: "Quá Hạn", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getExtensionStatusBadge = (status: string) => {
    const config: any = {
      PENDING: {
        label: "Chờ Duyệt",
        className: "bg-yellow-100 text-yellow-800",
      },
      APPROVED: { label: "Đã Duyệt", className: "bg-green-100 text-green-800" },
      REJECTED: { label: "Từ Chối", className: "bg-red-100 text-red-800" },
    };
    const statusConfig = config[status] || config.PENDING;
    return (
      <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
    );
  };

  const handleApproveExtension = async (extensionId: string) => {
    try {
      await bookingService.approveExtension(extensionId);
      toast.success("Đã duyệt yêu cầu gia hạn");
      loadBookingData();
    } catch (error) {
      toast.error("Không thể duyệt yêu cầu gia hạn");
    }
  };

  const handleRejectExtension = async (extensionId: string) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      await bookingService.rejectExtension(extensionId, reason);
      toast.success("Đã từ chối yêu cầu gia hạn");
      loadBookingData();
    } catch (error) {
      toast.error("Không thể từ chối yêu cầu gia hạn");
    }
  };

  const handleVerifyCheckInOut = async (checkInOutId: string) => {
    try {
      await bookingService.verifyCheckInOut(checkInOutId);
      toast.success("Đã xác nhận check-in/out");
      loadBookingData();
    } catch (error) {
      toast.error("Không thể xác nhận check-in/out");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus || !booking) {
      toast.error("Vui lòng chọn trạng thái");
      return;
    }

    if (selectedStatus === booking.status) {
      toast.error("Trạng thái mới giống trạng thái hiện tại");
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await bookingService.updateBookingStatus(booking.id, selectedStatus);
      toast.success("Cập nhật trạng thái thành công");
      setShowStatusSelector(false);
      setSelectedStatus("");
      loadBookingData();
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getHistoryActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      CREATED: "Tạo đơn thuê",
      DEPOSIT_PAID: "Thanh toán cọc",
      FULLY_PAID: "Thanh toán đầy đủ",
      CHECKED_IN: "Nhận xe",
      CHECKED_OUT: "Trả xe",
      CANCELLED: "Hủy đơn",
      REFUNDED: "Hoàn tiền",
      EXTENSION_REQUESTED: "Yêu cầu gia hạn",
      EXTENSION_APPROVED: "Duyệt gia hạn",
      EXTENSION_REJECTED: "Từ chối gia hạn",
    };
    return labels[action] || action;
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

  if (!booking) {
    return (
      <div className="space-y-6">
        <Link to="/vehicle-rentals">
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/vehicle-rentals">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay Lại
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          {getStatusBadge(booking.status)}
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
                    <SelectItem value="PENDING">Chờ Thanh Toán</SelectItem>
                    <SelectItem value="DEPOSIT_PAID">
                      Đã Thanh Toán Giữ Chỗ
                    </SelectItem>
                    <SelectItem value="FULLY_PAID">Đã Thanh Toán Đủ</SelectItem>
                    <SelectItem value="ONGOING">Đang Thuê</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn Thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã Hủy</SelectItem>
                    <SelectItem value="EXPIRED">Hết Hạn</SelectItem>
                    <SelectItem value="OVERDUE">Quá Hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || !selectedStatus}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdatingStatus ? "Đang cập nhật..." : "Xác Nhận"}
              </Button>
              <Button
                onClick={() => {
                  setShowStatusSelector(false);
                  setSelectedStatus("");
                }}
                variant="outline"
              >
                Hủy
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Trạng thái hiện tại:{" "}
              <strong>{getStatusBadge(booking.status)}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Chi Tiết Đơn Thuê</CardTitle>
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                  {booking.id.substring(0, 13)}...
                </code>
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
                    Check-in/out ({checkInOuts.length})
                  </TabsTrigger>
                  <TabsTrigger value="extensions">
                    Gia Hạn ({extensions.length})
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-medium text-sm">
                        {booking.userId.substring(0, 13)}...
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Vehicle ID</p>
                      <p className="font-medium text-sm">
                        {booking.vehicleId.substring(0, 13)}...
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Thời Gian Bắt Đầu
                        </p>
                        <p className="font-medium">
                          {formatDateTime(booking.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Thời Gian Kết Thúc
                        </p>
                        <p className="font-medium">
                          {formatDateTime(booking.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Thời Lượng</p>
                      <p className="font-medium">
                        {booking.duration >= 24
                          ? `${Math.floor(booking.duration / 24)} ngày ${
                              booking.duration % 24 > 0
                                ? `${booking.duration % 24} giờ`
                                : ""
                            }`
                          : `${booking.duration} giờ`}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Địa Chỉ Nhận Xe</p>
                      <p className="font-medium">{booking.pickupAddress}</p>
                      <p className="text-xs text-gray-500">
                        {booking.pickupLat.toFixed(6)},{" "}
                        {booking.pickupLng.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  {booking.notes && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Ghi Chú</p>
                          <p className="text-sm mt-1">{booking.notes}</p>
                        </div>
                      </div>
                    </>
                  )}

                  {booking.damageReported && (
                    <>
                      <Separator />
                      <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-red-700 font-medium">
                            Đã Báo Cáo Hư Hỏng
                          </p>
                          <p className="text-sm mt-1">
                            Phương tiện có báo cáo hư hỏng
                          </p>
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
                          <p className="font-medium">
                            {getHistoryActionLabel(item.action)}
                          </p>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">
                              {item.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDateTime(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Chưa có lịch sử
                    </p>
                  )}
                </TabsContent>

                {/* Check-ins Tab */}
                <TabsContent value="checkins" className="space-y-4 mt-4">
                  {checkInOuts.length > 0 ? (
                    checkInOuts.map((checkIn) => (
                      <div key={checkIn.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                checkIn.type === "CHECK_IN"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-blue-100 text-blue-800"
                              }
                            >
                              {checkIn.type === "CHECK_IN"
                                ? "Nhận Xe"
                                : "Trả Xe"}
                            </Badge>
                            {checkIn.verified && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã Xác Nhận
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(checkIn.createdAt)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">Số Km</p>
                            <p className="font-medium">
                              {checkIn.mileage.toLocaleString()} km
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Mức Xăng</p>
                            <p className="font-medium">{checkIn.fuelLevel}%</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-1">Địa Điểm</p>
                          <p className="text-sm">{checkIn.address}</p>
                          <p className="text-xs text-gray-500">
                            {checkIn.latitude.toFixed(6)},{" "}
                            {checkIn.longitude.toFixed(6)}
                          </p>
                        </div>

                        {checkIn.damageNotes && (
                          <div className="bg-red-50 p-3 rounded-lg mb-3">
                            <p className="text-sm text-red-700 font-medium">
                              Ghi Chú Hư Hỏng
                            </p>
                            <p className="text-sm mt-1">
                              {checkIn.damageNotes}
                            </p>
                          </div>
                        )}

                        {checkIn.images.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-600 mb-2">
                              Hình Ảnh ({checkIn.images.length})
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                              {checkIn.images.slice(0, 5).map((img, idx) => (
                                <div
                                  key={idx}
                                  className="aspect-square bg-gray-100 rounded overflow-hidden"
                                >
                                  <img
                                    src={img}
                                    alt={`Check-in ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {checkIn.damageImages.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-red-600 font-medium mb-2">
                              Hình Ảnh Hư Hỏng ({checkIn.damageImages.length})
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                              {checkIn.damageImages
                                .slice(0, 5)
                                .map((img, idx) => (
                                  <div
                                    key={idx}
                                    className="aspect-square bg-red-50 rounded overflow-hidden border border-red-200"
                                  >
                                    <img
                                      src={img}
                                      alt={`Damage ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {!checkIn.verified && (
                          <Button
                            size="sm"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleVerifyCheckInOut(checkIn.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Xác Nhận{" "}
                            {checkIn.type === "CHECK_IN" ? "Nhận Xe" : "Trả Xe"}
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Chưa có check-in/check-out
                    </p>
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
                            <p className="text-sm text-gray-600">
                              Thời Gian Cũ
                            </p>
                            <p className="font-medium">
                              {formatDateTime(ext.originalEndTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">
                              Thời Gian Mới
                            </p>
                            <p className="font-medium text-green-600">
                              {formatDateTime(ext.newEndTime)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-gray-600">
                              Thời Gian Thêm
                            </p>
                            <p className="font-medium">
                              +{ext.additionalHours} giờ
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Phí Thêm</p>
                            <p className="font-medium text-blue-600">
                              {formatCurrency(ext.additionalAmount)}
                            </p>
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
                            <p className="text-sm text-red-700 font-medium">
                              Lý Do Từ Chối
                            </p>
                            <p className="text-sm mt-1">
                              {ext.rejectionReason}
                            </p>
                          </div>
                        )}

                        <div className="text-sm text-gray-600 mb-3">
                          <p>Yêu cầu lúc: {formatDateTime(ext.createdAt)}</p>
                          {ext.approvedAt && (
                            <p>Duyệt lúc: {formatDateTime(ext.approvedAt)}</p>
                          )}
                        </div>

                        {ext.status === "PENDING" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveExtension(ext.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-red-600 hover:bg-red-50"
                              onClick={() => handleRejectExtension(ext.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Từ Chối
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      Chưa có yêu cầu gia hạn
                    </p>
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
                <span className="text-gray-600">
                  Phí thuê ({formatCurrency(booking.vehicleFeeHour)}/h)
                </span>
                <span className="font-medium">
                  {formatCurrency(booking.rentalFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bảo hiểm</span>
                <span className="font-medium">
                  {formatCurrency(booking.insuranceFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (10%)</span>
                <span className="font-medium">
                  {formatCurrency(booking.vat)}
                </span>
              </div>
              {booking.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Giảm giá</span>
                  <span className="font-medium text-green-600">
                    -{formatCurrency(booking.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tiền cọc</span>
                <span className="font-medium">
                  {formatCurrency(booking.deposit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tiền thế chấp</span>
                <span className="font-medium">
                  {formatCurrency(booking.collateral)}
                </span>
              </div>

              {(booking.penaltyAmount > 0 ||
                booking.damageAmount > 0 ||
                booking.overtimeAmount > 0) && (
                <>
                  <Separator />
                  <p className="text-sm font-medium text-red-600">
                    Các khoản phí phạt:
                  </p>
                  {booking.penaltyAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí phạt</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(booking.penaltyAmount)}
                      </span>
                    </div>
                  )}
                  {booking.damageAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí hư hỏng</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(booking.damageAmount)}
                      </span>
                    </div>
                  )}
                  {booking.overtimeAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí quá hạn</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(booking.overtimeAmount)}
                      </span>
                    </div>
                  )}
                </>
              )}

              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">Tổng Cộng</span>
                <span className="text-xl font-bold text-[#007BFF]">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>

              {booking.refundAmount > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between bg-green-50 p-3 rounded-lg">
                    <span className="font-medium text-green-700">Hoàn Lại</span>
                    <span className="font-bold text-green-700">
                      {formatCurrency(booking.refundAmount)}
                    </span>
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
                <Badge
                  className={
                    booking.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-800"
                      : booking.paymentStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : booking.paymentStatus === "FAILED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {booking.paymentStatus === "PAID"
                    ? "Đã Thanh Toán"
                    : booking.paymentStatus === "PENDING"
                    ? "Chờ Thanh Toán"
                    : booking.paymentStatus === "FAILED"
                    ? "Thất Bại"
                    : "Đã Hoàn Tiền"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Hệ Thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Ngày tạo</p>
                <p className="font-medium">
                  {formatDateTime(booking.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Cập nhật lần cuối</p>
                <p className="font-medium">
                  {formatDateTime(booking.updatedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
