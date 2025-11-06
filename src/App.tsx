import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Toaster } from './components/ui/sonner';
import { apiService } from './lib/api';
import { ChatPage } from './pages/chat/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { ComboDetailPage } from './pages/equipment/ComboDetailPage';
import { ComboFormPage } from './pages/equipment/ComboFormPage';
import { EquipmentDetailPage } from './pages/equipment/EquipmentDetailPage';
import { EquipmentFormPage } from './pages/equipment/EquipmentFormPage';
import { EquipmentRentalDetailPage } from './pages/equipment/EquipmentRentalDetailPage';
import { EquipmentRentalsListPage } from './pages/equipment/EquipmentRentalsListPage';
import { EquipmentsListPage } from './pages/equipment/EquipmentsListPage';
import { LoginPage } from './pages/LoginPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { PaymentDetailPage } from './pages/payments/PaymentDetailPage';
import { PaymentsListPage } from './pages/payments/PaymentsListPage';
import { RefundDetailPage } from './pages/payments/RefundDetailPage';
import { RefundsListPage } from './pages/payments/RefundsListPage';
import { TransactionsListPage } from './pages/payments/TransactionsListPage';
import { PostDetailPage } from './pages/posts/PostDetailPage';
import { PostFormPage } from './pages/posts/PostFormPage';
import { PostsListPage } from './pages/posts/PostsListPage';
import { RentalDetailPage } from './pages/rentals/RentalDetailPage';
import { RentalsListPage } from './pages/rentals/RentalsListPage';
import { ReviewDetailPage } from './pages/reviews/ReviewDetailPage';
import { ReviewsListPage } from './pages/reviews/ReviewsListPage';
import { ReportsPage } from './pages/system/ReportsPage';
import { SettingsPage } from './pages/system/SettingsPage';
import { UserDetailPage } from './pages/users/UserDetailPage';
import { UsersListPage } from './pages/users/UsersListPage';
import { VehicleDetailPage } from './pages/vehicles/VehicleDetailPage';
import { VehicleFormPage } from './pages/vehicles/VehicleFormPage';
import { VehiclesListPage } from './pages/vehicles/VehiclesListPage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => apiService.isAuthenticated());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F9FA]">
        <TopBar onLogout={handleLogout} onToggleSidebar={toggleSidebar} />
        <Sidebar isOpen={sidebarOpen} />
        <Toaster position="top-right" />
        
        <main
          className={`pt-16 transition-all duration-300 ${
            sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/preview_page.html" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Users */}
              <Route path="/users" element={<UsersListPage />} />
              <Route path="/users/new" element={<UserDetailPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
              <Route path="/users/:id/edit" element={<UserDetailPage />} />
              
              {/* Vehicle Rentals - Thuê Phương Tiện */}
              <Route path="/vehicles" element={<VehiclesListPage />} />
              <Route path="/vehicles/new" element={<VehicleFormPage />} />
              <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
              <Route path="/vehicles/:id/edit" element={<VehicleFormPage />} />
              
              <Route path="/vehicle-rentals" element={<RentalsListPage />} />
              <Route path="/vehicle-rentals/new" element={<RentalDetailPage />} />
              <Route path="/vehicle-rentals/:id" element={<RentalDetailPage />} />
              <Route path="/vehicle-rentals/:id/edit" element={<RentalDetailPage />} />
              
              {/* Equipment Rentals - Thuê Thiết Bị */}
              <Route path="/equipment" element={<EquipmentsListPage />} />
              <Route path="/equipment/new" element={<EquipmentFormPage />} />
              <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
              <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />
              
              {/* Combos */}
              <Route path="/equipment/combos/new" element={<ComboFormPage />} />
              <Route path="/equipment/combos/:id" element={<ComboDetailPage />} />
              <Route path="/equipment/combos/:id/edit" element={<ComboFormPage />} />
              
              <Route path="/equipment-rentals" element={<EquipmentRentalsListPage />} />
              <Route path="/equipment-rentals/new" element={<EquipmentRentalDetailPage />} />
              <Route path="/equipment-rentals/:id" element={<EquipmentRentalDetailPage />} />
              <Route path="/equipment-rentals/:id/edit" element={<EquipmentRentalDetailPage />} />
              
              {/* Reviews - Đánh Giá (Unified) */}
              <Route path="/reviews" element={<ReviewsListPage />} />
              <Route path="/reviews/new" element={<ReviewDetailPage />} />
              <Route path="/reviews/:id" element={<ReviewDetailPage />} />
              <Route path="/reviews/:id/edit" element={<ReviewDetailPage />} />
              
              {/* Posts - Bài Viết */}
              <Route path="/posts" element={<PostsListPage />} />
              <Route path="/posts/new" element={<PostFormPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/posts/:id/edit" element={<PostFormPage />} />
              
              {/* Payments - Thanh Toán */}
              <Route path="/payments" element={<PaymentsListPage />} />
              <Route path="/payments/:id" element={<PaymentDetailPage />} />
              
              {/* Refunds - Hoàn Tiền */}
              <Route path="/refunds" element={<RefundsListPage />} />
              <Route path="/refunds/:id" element={<RefundDetailPage />} />
              
              {/* Transactions - Giao Dịch */}
              <Route path="/transactions" element={<TransactionsListPage />} />
              
              {/* Notifications & Chat */}
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              
              {/* System */}
              <Route path="/system" element={<ReportsPage />} />
              <Route path="/system/reports" element={<ReportsPage />} />
              <Route path="/system/settings" element={<SettingsPage />} />
              
              {/* Legacy routes - redirect to new structure */}
              <Route path="/rentals" element={<Navigate to="/vehicle-rentals" replace />} />
              <Route path="/rentals/:id" element={<Navigate to="/vehicle-rentals" replace />} />
              <Route path="/vehicle-reviews" element={<Navigate to="/reviews" replace />} />
              <Route path="/equipment-reviews" element={<Navigate to="/reviews" replace />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
