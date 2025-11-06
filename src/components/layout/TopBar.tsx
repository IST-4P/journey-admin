import { Bell, LogOut, Menu } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { authService } from "../../lib/services/auth.service";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface TopBarProps {
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function TopBar({ onLogout, onToggleSidebar }: TopBarProps) {
  const handleLogout = async () => {
    try {
      // Gọi API logout để xóa cookies trên server
      await authService.logout();
      toast.success("Đăng xuất thành công");
      // Gọi callback để cập nhật state
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn đăng xuất ở client ngay cả khi API lỗi
      onLogout();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-200 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Menu toggle & Logo */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard">
              <h1 className="text-xl text-[#007BFF]">HacMieu Journey</h1>
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#007BFF] text-white">
                    AD
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm">Admin</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng Xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
