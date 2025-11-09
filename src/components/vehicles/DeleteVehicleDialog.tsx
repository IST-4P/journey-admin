import { Trash } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import * as vehicleService from '../../lib/services/vehicle.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';

interface DeleteVehicleDialogProps {
  vehicleId: string;
  vehicleName: string;
  onConfirm?: (vehicleId: string) => void;
}

export function DeleteVehicleDialog({
  vehicleId,
  vehicleName,
  onConfirm,
}: DeleteVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await vehicleService.deleteVehicle({ id: vehicleId });
      toast.success('Xóa phương tiện thành công!');
      setOpen(false);
      
      // Call onConfirm callback to refresh list
      if (onConfirm) {
        onConfirm(vehicleId);
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      // Toast error already handled in axios interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Trash className="h-4 w-4 text-red-600" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác Nhận Xóa Phương Tiện</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa phương tiện <strong>{vehicleName}</strong>?
            <br />
            <br />
            Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến phương tiện này sẽ bị
            xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xóa...
              </>
            ) : (
              'Xóa'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
