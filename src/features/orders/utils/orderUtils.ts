import type { CartItem, Order } from '@/types';

export function tableSortValue(tableNumber: string) {
  const numericValue = Number.parseInt(tableNumber, 10);
  return Number.isNaN(numericValue) ? Number.MAX_SAFE_INTEGER : numericValue;
}

export function getOrderDisplayName(order: Order) {
  if (order.tableNumber === 'Instant') {
    return order.customerName || 'Instant Order';
  }

  if (order.tableNumber === 'Custom' && order.customerName) {
    return order.customerName;
  }

  return `Table ${order.tableNumber}`;
}

export function getOrderItemCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateItemTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = 0;
  const total = subtotal;

  return { subtotal, tax, total };
}
