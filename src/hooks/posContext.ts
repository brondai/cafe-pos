import { createContext } from 'react';
import type { CartItem, InvoiceSettings, Order } from '@/types';

export interface POSContextType {
  cart: CartItem[];
  orders: Order[];
  invoiceSettings: InvoiceSettings;
  invoiceOrder: Order | null;
  selectedTable: string;
  selectedCategory: string;
  subtotal: number;
  updateInvoiceSettings: (settings: Partial<InvoiceSettings>) => void;
  dismissInvoice: () => void;
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedTable: (table: string) => void;
  setSelectedCategory: (category: string) => void;
  placeOrder: (customerName?: string, tableNumber?: string) => Order | null;
  updateOrderItems: (orderId: string, items: CartItem[]) => void;
  chargeOrder: (
    order: Order,
    paymentMethod: NonNullable<Order['paymentMethod']>
  ) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const POSContext = createContext<POSContextType | undefined>(undefined);
