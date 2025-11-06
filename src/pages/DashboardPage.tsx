import { DollarSign, MessageSquare, ShoppingCart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { StatsCard } from '../components/common/StatsCard';
import { dashboardStats, monthlyRevenue } from '../lib/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardPage() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Dashboard Tổng Quan</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Người Dùng Mới"
          value={dashboardStats.newUsers}
          icon={Users}
          iconColor="#007BFF"
        />
        <StatsCard
          title="Đơn Thuê Đang Hoạt Động"
          value={dashboardStats.activeRentals}
          icon={ShoppingCart}
          iconColor="#28A745"
        />
        <StatsCard
          title="Doanh Thu Gần Nhất"
          value={formatCurrency(dashboardStats.recentRevenue)}
          icon={DollarSign}
          iconColor="#FFC107"
        />
        <StatsCard
          title="Đánh Giá Mới"
          value={dashboardStats.newReviews}
          icon={MessageSquare}
          iconColor="#DC3545"
        />
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Tháng - Theo Nghiệp Vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="vehicleRevenue"
                stroke="#007BFF"
                strokeWidth={2}
                name="Thuê Phương Tiện"
              />
              <Line
                type="monotone"
                dataKey="equipmentRevenue"
                stroke="#28A745"
                strokeWidth={2}
                name="Thuê Thiết Bị"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FFC107"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Tổng Doanh Thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
