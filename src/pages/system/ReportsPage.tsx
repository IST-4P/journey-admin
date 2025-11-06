import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { cancellationRate, monthlyRevenue, popularItems, revenueByBusiness } from '../../lib/mockData';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export function ReportsPage() {
  const COLORS = ['#007BFF', '#28A745', '#FFC107', '#DC3545'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl">Báo Cáo & Thống Kê</h2>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc Thời Gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Từ Ngày</Label>
              <Input id="startDate" type="date" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="endDate">Đến Ngày</Label>
              <Input id="endDate" type="date" className="mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart by Business */}
      <Card>
        <CardHeader>
          <CardTitle>Doanh Thu Theo Tháng - Theo Nghiệp Vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Bar dataKey="vehicleRevenue" fill="#007BFF" name="Thuê Phương Tiện" stackId="a" />
              <Bar dataKey="equipmentRevenue" fill="#28A745" name="Thuê Thiết Bị" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Items - All */}
        <Card>
          <CardHeader>
            <CardTitle>Tỷ Lệ Sử Dụng Theo Loại</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularItems}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {popularItems.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Business Type */}
        <Card>
          <CardHeader>
            <CardTitle>Doanh Thu Theo Nghiệp Vụ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByBusiness}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByBusiness.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#007BFF' : '#28A745'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Cancellation Rate Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Tỷ Lệ Hủy Đơn (%) - So Sánh Theo Nghiệp Vụ</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cancellationRate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip labelStyle={{ color: '#000' }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="vehicleRate"
                stroke="#007BFF"
                strokeWidth={2}
                name="Thuê Phương Tiện"
              />
              <Line
                type="monotone"
                dataKey="equipmentRate"
                stroke="#28A745"
                strokeWidth={2}
                name="Thuê Thiết Bị"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
