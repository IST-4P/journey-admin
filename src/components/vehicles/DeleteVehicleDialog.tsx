import { Trash } from 'lucide-react';
import { useState } from 'react';
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

  const handleDelete = () => {
    console.log('Delete vehicle:', vehicleId);
    if (onConfirm) {
      onConfirm(vehicleId);
    }
    setOpen(false);
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
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
