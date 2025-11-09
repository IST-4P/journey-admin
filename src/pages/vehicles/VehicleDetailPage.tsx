import { ArrowLeft, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { DeleteVehicleDialog } from '../../components/vehicles/DeleteVehicleDialog';
import * as vehicleService from '../../lib/services/vehicle.service';
import type { GetVehicleResponse } from '../../lib/types/vehicle.types';

export function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<GetVehicleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) {
        navigate('/vehicles');
        return;
      }

      try {
        setLoading(true);
        const data = await vehicleService.getVehicle(id);
        setVehicle(data);
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        toast.error('Không thể tải thông tin phương tiện');
        navigate('/vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, navigate]);

  const handleDeleteSuccess = () => {
    toast.success('Xóa phương tiện thành công!');
    navigate('/vehicles');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'RENTED':
        return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      case 'RESERVED':
        return 'bg-purple-100 text-purple-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const upperStatus = status.toUpperCase();
    switch (upperStatus) {
      case 'ACTIVE':
        return 'Hoạt động';
      case 'RENTED':
        return 'Đang thuê';
      case 'MAINTENANCE':
        return 'Bảo trì';
      case 'RESERVED':
        return 'Đã đặt';
      case 'INACTIVE':
        return 'Không hoạt động';
      default:
        return status;
    }
  };

  const getTransmissionLabel = (transmission: string) => {
    return transmission === 'AUTOMATIC' ? 'Tự động' : 'Số sàn';
  };

  const getFuelTypeLabel = (fuelType: string) => {
    const fuelMap: Record<string, string> = {
      GASOLINE: 'Xăng',
      DIESEL: 'Dầu Diesel',
      ELECTRIC: 'Điện',
      HYBRID: 'Hybrid',
      UNLEADED_GASOLINE: 'Xăng không chì',
    };
    return fuelMap[fuelType] || fuelType;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin phương tiện...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl">Chi Tiết Phương Tiện</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigate(`/vehicles/${id}/edit`)}
            className="bg-[#007BFF] hover:bg-[#0056b3]"
          >
            <Edit className="h-4 w-4 mr-2" />
            Chỉnh Sửa
          </Button>
          <DeleteVehicleDialog
            vehicleId={vehicle.id}
            vehicleName={vehicle.name}
            onConfirm={handleDeleteSuccess}
          />
        </div>
      </div>

      {/* Images */}
      {vehicle.images && vehicle.images.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vehicle.images.map((img, index) => (
                <div key={index} className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={img}
                    alt={`${vehicle.name} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x200';
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tên Xe</p>
                <p className="font-medium">{vehicle.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Loại Xe</p>
                <Badge variant="outline">
                  {vehicle.type === 'CAR' ? 'Ô tô' : 'Xe máy'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số Chỗ Ngồi</p>
                <p className="font-medium">{vehicle.seats} chỗ</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hộp Số</p>
                <p className="font-medium">{getTransmissionLabel(vehicle.transmission)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nhiên Liệu</p>
                <p className="font-medium">{getFuelTypeLabel(vehicle.fuelType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Trạng Thái</p>
                <Badge className={getStatusColor(vehicle.status)}>
                  {getStatusLabel(vehicle.status)}
                </Badge>
              </div>
            </div>

            {vehicle.description && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Mô Tả</p>
                <p className="text-gray-700">{vehicle.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Giá Thuê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Giá/Giờ</p>
                <p className="font-semibold text-lg">{formatCurrency(vehicle.pricePerHour)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Giá/Ngày</p>
                <p className="font-semibold text-lg">{formatCurrency(vehicle.pricePerDay)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống Kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Đánh giá trung bình</span>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="font-semibold">{vehicle.averageRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Số chuyến đi</span>
                <span className="font-semibold">{vehicle.totalTrips}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Vị Trí</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Địa Chỉ</p>
                <p className="font-medium">{vehicle.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Thành Phố</p>
                <p className="font-medium">{vehicle.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quận/Huyện</p>
                <p className="font-medium">{vehicle.ward}</p>
              </div>
              {vehicle.latitude && vehicle.longitude && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">Vĩ Độ</p>
                    <p className="font-medium">{vehicle.latitude.toFixed(6)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Kinh Độ</p>
                    <p className="font-medium">{vehicle.longitude.toFixed(6)}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        {vehicle.vehicleFeatures && vehicle.vehicleFeatures.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Tiện Nghi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {vehicle.vehicleFeatures.map((vf, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-[#007BFF]">✓</span>
                    <div>
                      <p className="font-medium text-sm">{vf.feature.name}</p>
                      <p className="text-xs text-gray-500">{vf.feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Terms */}
        {vehicle.terms && vehicle.terms.length > 0 && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Điều Khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2">
                {vehicle.terms.map((term, index) => (
                  <li key={index} className="text-gray-700">
                    {term}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
