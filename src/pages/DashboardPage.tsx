import { usePOS } from '@/hooks/usePOS';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  Clock,
  TrendingUp,
  Coffee,
  Users,
  Receipt,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export function DashboardPage() {
  const { orders } = usePOS();

  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );

  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = todayOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const activeOrders = todayOrders.filter((o) => o.status === 'active').length;

  // Sales by hour
  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 7;
    const hourOrders = todayOrders.filter((o) => {
      const orderHour = new Date(o.createdAt).getHours();
      return orderHour === hour;
    });
    return {
      time: `${hour}:00`,
      sales: hourOrders.reduce((sum, o) => sum + o.total, 0),
      orders: hourOrders.length,
    };
  });

  // Sales by category
  const categoryData = [
    { name: 'Coffee', value: todayOrders.filter((o) => o.items.some((i) => i.category === 'coffee')).length },
    { name: 'Tea', value: todayOrders.filter((o) => o.items.some((i) => i.category === 'tea')).length },
    { name: 'Pastry', value: todayOrders.filter((o) => o.items.some((i) => i.category === 'pastry')).length },
    { name: 'Food', value: todayOrders.filter((o) => o.items.some((i) => ['breakfast', 'lunch'].includes(i.category))).length },
    { name: 'Other', value: todayOrders.filter((o) => o.items.some((i) => ['dessert', 'beverages'].includes(i.category))).length },
  ];

  const stats = [
    {
      title: "Today's Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      icon: Receipt,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Avg Order',
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-violet-50 text-violet-700',
    },
    {
      title: 'Active',
      value: activeOrders.toString(),
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Hourly Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="sales" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Coffee className="h-4 w-4" />
                Sales by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orders
                .filter((order) => order.status !== 'cancelled')
                .slice(0, 5)
                .map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Table {order.tableNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()} &middot;{' '}
                      {order.items.length} items
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-violet-700">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              ))}
              {orders.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No orders yet today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
