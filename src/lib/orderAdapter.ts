/**
 * Maps tRPC order responses (DB shape) to the frontend Order / CartItem types
 * used throughout the UI.
 *
 * Key differences:
 *   DB                     Frontend
 *   ---------------------  ---------------------
 *   priceAmount (int, paise/paisa minor units)  price (float, major units)
 *   subtotalAmount         subtotal
 *   taxAmount              tax
 *   totalAmount            total
 *   status 'ACTIVE'        status 'active'
 *   paymentMethod 'CASH'   paymentMethod 'cash'
 */

import type { CartItem, Order } from '@/types';

// ── Types mirroring the tRPC router output ───────────────────────────────────

export interface DbOrderItem {
  id: string;
  orderId: string;
  menuItemId: string | null;
  variantId: string | null;
  name: string;
  variantName: string;
  priceAmount: number;
  quantity: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DbOrder {
  id: string;
  locationId: string;
  tableNumber: string;
  customerName: string | null;
  serviceMode: string;
  status: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  currencyCode: string;
  paymentMethod: string | null;
  paidAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  items: DbOrderItem[];
}

// ── Converters ───────────────────────────────────────────────────────────────

function toMajorUnits(minor: number): number {
  return minor / 100;
}

function mapStatus(dbStatus: string): Order['status'] {
  switch (dbStatus) {
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'active';
  }
}

function mapPaymentMethod(dbMethod: string | null): Order['paymentMethod'] {
  switch (dbMethod) {
    case 'CASH':
      return 'cash';
    case 'CARD':
      return 'card';
    case 'QR':
      return 'qr';
    default:
      return undefined;
  }
}

export function dbItemToCartItem(item: DbOrderItem): CartItem {
  return {
    // Use variantId if present, else menuItemId, else the OrderItem id as fallback
    id: item.variantId ?? item.menuItemId ?? item.id,
    name: item.name,
    description: item.variantName === 'Default' ? '' : item.variantName,
    price: toMajorUnits(item.priceAmount),
    category: '',
    quantity: item.quantity,
    notes: item.notes ?? undefined,
  };
}

export function dbOrderToOrder(dbOrder: DbOrder): Order {
  return {
    id: dbOrder.id,
    tableNumber: dbOrder.tableNumber,
    customerName: dbOrder.customerName ?? undefined,
    items: dbOrder.items.map(dbItemToCartItem),
    subtotal: toMajorUnits(dbOrder.subtotalAmount),
    tax: toMajorUnits(dbOrder.taxAmount),
    total: toMajorUnits(dbOrder.totalAmount),
    status: mapStatus(dbOrder.status),
    paymentMethod: mapPaymentMethod(dbOrder.paymentMethod),
    createdAt: dbOrder.createdAt,
  };
}

// ── Cart → tRPC input helpers ────────────────────────────────────────────────

export function cartItemToCreateInput(item: CartItem) {
  return {
    name: item.name,
    variantName: 'Default' as const,
    priceAmount: Math.round(item.price * 100),
    quantity: item.quantity,
    notes: item.notes,
  };
}

export function toMinorUnits(major: number): number {
  return Math.round(major * 100);
}
