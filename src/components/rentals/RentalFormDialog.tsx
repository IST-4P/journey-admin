import { Edit, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';

interface RentalFormData {
  userId: number;
  userName: string;
  vehicleId: number;
  vehicleName: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'pending_payment' | 'cancelled';
  rentalFee: number;
  insurance: number;
  vat: number;
  deposit: number;
  totalFee: number;
  checkInImages: string[];
  checkOutImages: string[];
  notes?: string;
}

interface RentalFormDialogProps {
  mode?: 'edit';
  rentalData?: Partial<RentalFormData>;
  trigger?: React.ReactNode;
}

const initialFormData: RentalFormData = {
  userId: 0,
  userName: '',
  vehicleId: 0,
  vehicleName: '',
  startDate: '',
  endDate: '',
  status: 'active',
  rentalFee: 0,
  insurance: 0,
  vat: 0,
  deposit: 0,
  totalFee: 0,
  checkInImages: [],
  checkOutImages: [],
};

export function RentalFormDialog({ mode = 'edit', rentalData, trigger }: RentalFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<RentalFormData>(initialFormData);
  const [checkInUrls, setCheckInUrls] = useState<string[]>([]);
  const [checkOutUrls, setCheckOutUrls] = useState<string[]>([]);

  // Load rental data when in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && rentalData) {
      setFormData({ ...initialFormData, ...rentalData });
      setCheckInUrls(rentalData.checkInImages || []);
      setCheckOutUrls(rentalData.checkOutImages || []);
    }
  }, [open, mode, rentalData]);

  // Calculate total fee
  useEffect(() => {
    const total = formData.rentalFee + formData.insurance + formData.vat;
    setFormData((prev) => ({ ...prev, totalFee: total }));
  }, [formData.rentalFee, formData.insurance, formData.vat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      checkInImages: checkInUrls,
      checkOutImages: checkOutUrls,
    };
    console.log('Update rental data:', submitData);
    // Reset form and close dialog
    setFormData(initialFormData);
    setCheckInUrls([]);
    setCheckOutUrls([]);
    setOpen(false);
  };

  const handleAddCheckInImage = () => {
    const url = prompt('Nhập URL hình ảnh check-in:');
    if (url && url.trim()) {
      setCheckInUrls([...checkInUrls, url.trim()]);
    }
  };

  const handleAddCheckOutImage = () => {
    const url = prompt('Nhập URL hình ảnh check-out:');
    if (url && url.trim()) {
      setCheckOutUrls([...checkOutUrls, url.trim()]);
    }
  };

  const handleRemoveCheckInImage = (index: number) => {
    setCheckInUrls(checkInUrls.filter((_, i) => i !== index));
  };

  const handleRemoveCheckOutImage = (index: number) => {
    setCheckOutUrls(checkOutUrls.filter((_, i) => i !== index));
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Edit className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Đơn Thuê</DialogTitle>
          <DialogDescription>Cập nhật thông tin đơn thuê</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rental Information */}
          <div className="space-y-4">
            <h4>Thông Tin Đơn Thuê</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Người Thuê</Label>
                <Input value={formData.userName} disabled />
              </div>

              <div className="space-y-2">
                <Label>Phương Tiện</Label>
                <Input value={formData.vehicleName} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Ngày Bắt Đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Ngày Kết Thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng Thái *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: RentalFormData['status']) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang Thuê</SelectItem>
                    <SelectItem value="completed">Đã Hoàn Thành</SelectItem>
                    <SelectItem value="pending_payment">Chưa Thanh Toán</SelectItem>
                    <SelectItem value="cancelled">Đã Hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h4>Chi Phí</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rentalFee">Phí Thuê (VNĐ) *</Label>
                <Input
                  id="rentalFee"
                  type="number"
                  value={formData.rentalFee}
                  onChange={(e) =>
                    setFormData({ ...formData, rentalFee: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurance">Bảo Hiểm (VNĐ) *</Label>
                <Input
                  id="insurance"
                  type="number"
                  value={formData.insurance}
                  onChange={(e) =>
                    setFormData({ ...formData, insurance: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vat">VAT (VNĐ) *</Label>
                <Input
                  id="vat"
                  type="number"
                  value={formData.vat}
                  onChange={(e) =>
                    setFormData({ ...formData, vat: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deposit">Tiền Đặt Cọc (VNĐ) *</Label>
                <Input
                  id="deposit"
                  type="number"
                  value={formData.deposit}
                  onChange={(e) =>
                    setFormData({ ...formData, deposit: parseInt(e.target.value) || 0 })
                  }
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Tổng Chi Phí (VNĐ)</Label>
                <Input
                  value={formData.totalFee.toLocaleString('vi-VN')}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Check-in Images */}
          <div className="space-y-4">
            <h4>Hình Ảnh Check-in</h4>

            <Button type="button" onClick={handleAddCheckInImage} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Thêm Hình Check-in
            </Button>

            {checkInUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {checkInUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Check-in ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckInImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Check-out Images */}
          <div className="space-y-4">
            <h4>Hình Ảnh Check-out</h4>

            <Button type="button" onClick={handleAddCheckOutImage} variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Thêm Hình Check-out
            </Button>

            {checkOutUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {checkOutUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Check-out ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/150';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckOutImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h4>Ghi Chú</h4>

            <div className="space-y-2">
              <Textarea
                placeholder="Ghi chú về đơn thuê..."
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-[#007BFF] hover:bg-[#0056b3]">
              Cập Nhật
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
