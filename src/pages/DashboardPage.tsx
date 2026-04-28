import { useMemo, useState } from 'react';
import { usePOS } from '@/hooks/usePOS';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { Order } from '@/types';
import {
  ArrowLeft,
  Banknote,
  Calendar,
  Clock,
  Coffee,
  CreditCard,
  DollarSign,
  Package,
  QrCode,
  Receipt,
  Search,
  ShoppingBag,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

type DashboardView = 'overview' | 'orders' | 'items';
type PaymentFilter = 'all' | NonNullable<Order['paymentMethod']>;

const paymentFilters: Array<{
  value: PaymentFilter;
  label: string;
  icon: typeof Receipt;
}> = [
  { value: 'all', label: 'All', icon: Receipt },
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'qr', label: 'QR', icon: QrCode },
];

function getOrderDisplayName(order: { tableNumber: string; customerName?: string }) {
  if (order.tableNumber === 'Instant') {
    return order.customerName || 'Instant Order';
  }

  if (order.tableNumber === 'Custom' && order.customerName) {
    return order.customerName;
  }

  return `Table ${order.tableNumber}`;
}

function getOrderItemCount(order: Order) {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function DashboardPage() {
  const { orders } = usePOS();
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [completedSearchQuery, setCompletedSearchQuery] = useState('');

  const today = new Date().toDateString();
  const todayOrders = useMemo(
    () => orders.filter((order) => new Date(order.createdAt).toDateString() === today),
    [orders, today]
  );
  const completedTodayOrders = useMemo(
    () =>
      todayOrders
        .filter((order) => order.status === 'completed')
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [todayOrders]
  );

  const soldItemsToday = useMemo(() => {
    const itemMap = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        quantity: number;
        revenue: number;
        orders: number;
      }
    >();

    completedTodayOrders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = itemMap.get(item.id);

        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.quantity * item.price;
          existing.orders += 1;
          return;
        }

        itemMap.set(item.id, {
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          revenue: item.quantity * item.price,
          orders: 1,
        });
      });
    });

    return Array.from(itemMap.values()).sort((a, b) => {
      if (b.quantity !== a.quantity) return b.quantity - a.quantity;
      return b.revenue - a.revenue;
    });
  }, [completedTodayOrders]);

  const filteredCompletedOrders = useMemo(() => {
    const normalizedQuery = completedSearchQuery.trim().toLowerCase();

    return completedTodayOrders.filter((order) => {
      const matchesPayment =
        paymentFilter === 'all' || order.paymentMethod === paymentFilter;
      const matchesSearch =
        !normalizedQuery ||
        getOrderDisplayName(order).toLowerCase().includes(normalizedQuery) ||
        (order.paymentMethod?.toLowerCase().includes(normalizedQuery) ?? false) ||
        order.items.some((item) => item.name.toLowerCase().includes(normalizedQuery));

      return matchesPayment && matchesSearch;
    });
  }, [completedSearchQuery, completedTodayOrders, paymentFilter]);

  const totalRevenue = completedTodayOrders.reduce((sum, order) => sum + order.total, 0);
  const totalSalesOrders = completedTodayOrders.length;
  const totalItemsSold = soldItemsToday.reduce((sum, item) => sum + item.quantity, 0);
  const activeOrders = todayOrders.filter((order) => order.status === 'active').length;
  const filteredOrdersRevenue = filteredCompletedOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );
  const filteredOrdersItemCount = filteredCompletedOrders.reduce(
    (sum, order) => sum + getOrderItemCount(order),
    0
  );

  const hourlyData = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 7;
    const hourOrders = completedTodayOrders.filter((order) => {
      const orderHour = new Date(order.createdAt).getHours();
      return orderHour === hour;
    });

    return {
      time: `${hour}:00`,
      sales: hourOrders.reduce((sum, order) => sum + order.total, 0),
      orders: hourOrders.length,
    };
  });

  const categoryData = [
    {
      name: 'Coffee',
      value: completedTodayOrders.filter((order) =>
        order.items.some((item) => item.category === 'coffee')
      ).length,
    },
    {
      name: 'Tea',
      value: completedTodayOrders.filter((order) =>
        order.items.some((item) => item.category === 'tea')
      ).length,
    },
    {
      name: 'Pastry',
      value: completedTodayOrders.filter((order) =>
        order.items.some((item) => item.category === 'pastry')
      ).length,
    },
    {
      name: 'Food',
      value: completedTodayOrders.filter((order) =>
        order.items.some((item) => ['breakfast', 'lunch'].includes(item.category))
      ).length,
    },
    {
      name: 'Other',
      value: completedTodayOrders.filter((order) =>
        order.items.some((item) => ['dessert', 'beverages'].includes(item.category))
      ).length,
    },
  ];

  const stats = [
    {
      title: "Today's Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      title: 'Total Sales Orders',
      value: totalSalesOrders.toString(),
      icon: Receipt,
      color: 'bg-blue-50 text-blue-700',
      onClick: () => setActiveView('orders'),
    },
    {
      title: 'Total Items Sold',
      value: totalItemsSold.toString(),
      icon: ShoppingBag,
      color: 'bg-violet-50 text-violet-700',
      onClick: () => setActiveView('items'),
    },
    {
      title: 'Active Orders',
      value: activeOrders.toString(),
      icon: Clock,
      color: 'bg-amber-50 text-amber-700',
    },
  ];

  const returnToOverview = () => {
    setActiveView('overview');
    setPaymentFilter('all');
    setCompletedSearchQuery('');
  };

  if (activeView === 'orders') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={returnToOverview}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Today's Completed Orders
              </h2>
              <p className="text-xs text-gray-500">
                Filter by payment method or search by order and item.
              </p>
            </div>
          </div>

          <Card className="border-gray-200">
            <CardContent className="space-y-4 p-4">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search order, item, custom name, or payment..."
                    value={completedSearchQuery}
                    onChange={(event) => setCompletedSearchQuery(event.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto">
                  {paymentFilters.map((option) => {
                    const Icon = option.icon;
                    const isActive = paymentFilter === option.value;

                    return (
                      <Button
                        key={option.value}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        className={`h-9 shrink-0 ${
                          isActive ? 'bg-violet-600 hover:bg-violet-700' : ''
                        }`}
                        onClick={() => setPaymentFilter(option.value)}
                      >
                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-3">
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {filteredCompletedOrders.length}
                  </p>
                  <p className="text-xs text-gray-500">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {filteredOrdersItemCount}
                  </p>
                  <p className="text-xs text-gray-500">Items</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-violet-700">
                    ${filteredOrdersRevenue.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Receipt className="h-4 w-4" />
                Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredCompletedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border-b border-gray-100 py-3 last:border-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {getOrderDisplayName(order)}
                          </p>
                          {order.paymentMethod && (
                            <Badge
                              variant="outline"
                              className="capitalize text-[10px] text-gray-500"
                            >
                              {order.paymentMethod}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()} &middot;{' '}
                          {getOrderItemCount(order)} items
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-violet-700">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {order.items.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full bg-gray-50 px-2 py-1 text-[11px] text-gray-600"
                        >
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {filteredCompletedOrders.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    No completed orders match these filters
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (activeView === 'items') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={returnToOverview}
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Today's Items Sold
              </h2>
              <p className="text-xs text-gray-500">
                Item quantities from today's completed orders.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900">{totalItemsSold}</p>
                <p className="text-xs text-gray-500">Items Sold</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900">
                  {soldItemsToday.length}
                </p>
                <p className="text-xs text-gray-500">Unique Items</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-violet-700">
                  ${totalRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Item Revenue</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Package className="h-4 w-4" />
                Sold Item Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {soldItemsToday.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto] gap-3 border-b border-gray-100 py-3 last:border-0"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] text-gray-500"
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Sold in {item.orders} order{item.orders === 1 ? '' : 's'}{' '}
                        &middot; ${item.revenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-violet-700">
                        {item.quantity}
                      </p>
                      <p className="text-xs text-gray-500">qty</p>
                    </div>
                  </div>
                ))}
                {soldItemsToday.length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-400">
                    No items sold yet today
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const isClickable = Boolean(stat.onClick);

            return (
              <Card
                key={stat.title}
                className={`border-gray-200 ${
                  isClickable
                    ? 'cursor-pointer transition-all hover:border-violet-200 hover:shadow-sm'
                    : ''
                }`}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onClick={stat.onClick}
                onKeyDown={(event) => {
                  if (!stat.onClick) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    stat.onClick();
                  }
                }}
              >
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
      </div>
    </div>
  );
}
