import { toast as sonnerToast } from "sonner";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const useToast = () => {
  const toast = ({ title, description, variant }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title || "Lỗi", {
        description,
      });
    } else {
      sonnerToast.success(title || "Thành công", {
        description,
      });
    }
  };

  return { toast };
};
