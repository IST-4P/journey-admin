import { Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteDevice } from '../../lib/services/equipment.service';
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

interface DeleteEquipmentDialogProps {
  deviceId: string;
  deviceName: string;
  onConfirm?: (deviceId: string) => void;
}

export function DeleteEquipmentDialog({
  deviceId,
  deviceName,
  onConfirm,
}: DeleteEquipmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteDevice(deviceId);
      toast.success('Xóa thiết bị thành công!');
      setOpen(false);
      
      // Call onConfirm callback to refresh list
      if (onConfirm) {
        onConfirm(deviceId);
      }
    } catch (error) {
      console.error('Error deleting device:', error);
      toast.error('Không thể xóa thiết bị');
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
          <AlertDialogTitle>Xác Nhận Xóa Thiết Bị</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa thiết bị <strong>{deviceName}</strong>?
            <br />
            <br />
            Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến thiết bị này sẽ bị
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
