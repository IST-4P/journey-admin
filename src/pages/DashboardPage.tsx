import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Car, 
  RefreshCcw, 
  Package, 
  Layers, 
  Calendar,
  BookOpen,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { dashboardService, DashboardStats } from '../lib/services/dashboard.service';
import toast from 'react-hot-toast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <p className="text-gray-600">Không có dữ liệu</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng Người Dùng',
      value: stats.userCount,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Đơn Đang Hoạt Động',
      value: stats.bookingOngoing,
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Phương Tiện Hoạt Động',
      value: stats.vehicleActive,
      icon: Car,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Thiết Bị Khả Dụng',
      value: stats.deviceAvailable,
      icon: Package,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      title: 'Chờ Gia Hạn',
      value: stats.extensionPending,
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
    },
    {
      title: 'Chờ Trả Xe',
      value: stats.checkOutPending,
      icon: CheckCircle2,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
    },
    {
      title: 'Chờ Hoàn Tiền',
      value: stats.refundPending,
      icon: RefreshCcw,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Combo Hoạt Động',
      value: stats.comboActive,
      icon: Layers,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      title: 'Đơn thuê thiết bị',
      value: stats.rentalActive,
      icon: Calendar,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      iconColor: 'text-pink-600',
    },
    {
      title: 'Tổng Bài Viết',
      value: stats.blogCount,
      icon: BookOpen,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600',
    },
  ];

  // Dữ liệu cho Pie Chart - Phân bổ tài nguyên
  const resourceData = [
    { name: 'Phương Tiện', value: stats.vehicleActive, color: '#8b5cf6' },
    { name: 'Thiết Bị', value: stats.deviceAvailable, color: '#f97316' },
    { name: 'Combo', value: stats.comboActive, color: '#6366f1' },
  ];

  // Dữ liệu cho Pie Chart - Trạng thái đơn chờ xử lý
  const pendingData = [
    { name: 'Chờ Gia Hạn', value: stats.extensionPending, color: '#eab308' },
    { name: 'Chờ Trả Xe', value: stats.checkOutPending, color: '#06b6d4' },
    { name: 'Chờ Hoàn Tiền', value: stats.refundPending, color: '#ef4444' },
  ];

  // Dữ liệu cho Bar Chart - Hoạt động hệ thống
  const activityData = [
    { name: 'Người Dùng', value: stats.userCount, color: '#3b82f6' },
    { name: 'Đơn thuê xe ', value: stats.bookingOngoing, color: '#22c55e' },
    { name: 'Đơn thuê thiết bị', value: stats.rentalActive, color: '#ec4899' },
    { name: 'Bài Viết', value: stats.blogCount, color: '#14b8a6' },
  ];

  const COLORS = ['#8b5cf6', '#f97316', '#6366f1'];
  const PENDING_COLORS = ['#eab308', '#06b6d4', '#ef4444'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Tổng Quan</h1>
          
        </div>
        <button
          onClick={fetchDashboardStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      {/* Pie Charts Section - Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart - Phân bổ tài nguyên */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-purple-600" />
              Phân Bổ Tài Nguyên
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={resourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {resourceData.map((item, index) => (
                <div key={index} className="text-center p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-gray-600">{item.name}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart - Trạng thái chờ xử lý */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              Trạng Thái Chờ Xử Lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pendingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PENDING_COLORS[index % PENDING_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {pendingData.map((item, index) => (
                <div key={index} className="text-center p-3 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-medium text-gray-600">{item.name}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart - Bottom Full Width */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Tổng Quan Hoạt Động Hệ Thống
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#666', fontSize: 14 }}
                tickLine={{ stroke: '#666' }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 14 }}
                tickLine={{ stroke: '#666' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
              >
                {activityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {activityData.map((item, index) => (
              <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-600">{item.name}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{item.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
