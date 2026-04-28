import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { statusConfig } from '@/features/orders/constants';
import {
  getOrderDisplayName,
  getOrderItemCount,
} from '@/features/orders/utils/orderUtils';
import type { Order } from '@/types';
import { Clock, Plus, Search, XCircle } from 'lucide-react';

interface ActiveOrdersListProps {
  orders: Order[];
  searchQuery: string;
  selectedOrderId: string | null;
  onSearchChange: (query: string) => void;
  onNewOrder: () => void;
  onOpenOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export function ActiveOrdersList({
  orders,
  searchQuery,
  selectedOrderId,
  onSearchChange,
  onNewOrder,
  onOpenOrder,
  onCancelOrder,
}: ActiveOrdersListProps) {
  return (
    <>
      <div className="bg-white px-4 py-3 border-b border-gray-200 shrink-0 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by table or customer..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            className="h-10 bg-violet-600 hover:bg-violet-700"
            onClick={onNewOrder}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Clock className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No active orders</p>
          </div>
        ) : (
          orders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            const orderDate = new Date(order.createdAt);
            const itemCount = getOrderItemCount(order.items);
            const isSelected = selectedOrderId === order.id;
            const orderDisplayName = getOrderDisplayName(order);

            return (
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => onOpenOrder(order.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpenOrder(order.id);
                  }
                }}
                className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm hover:border-violet-200 ${
                  isSelected
                    ? 'border-violet-300 shadow-sm ring-1 ring-violet-100'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">
                        {orderDisplayName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] h-5 ${config.color}`}
                      >
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {orderDate.toLocaleTimeString()} &middot; {itemCount} items
                      {order.customerName && order.tableNumber !== 'Custom'
                        ? ` &middot; ${order.customerName}`
                        : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-violet-700">
                      ${order.total.toFixed(2)}
                    </span>
                    {order.paymentMethod && (
                      <p className="text-[11px] text-gray-500 capitalize">
                        {order.paymentMethod}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-600 mt-3 line-clamp-2">
                  {order.items.map((item, index) => (
                    <span key={item.id}>
                      {item.quantity}x {item.name}
                      {index < order.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>

                <div className="flex justify-end mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                    onClick={(event) => {
                      event.stopPropagation();
                      onCancelOrder(order.id);
                    }}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
