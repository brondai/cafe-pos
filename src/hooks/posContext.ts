import { createContext } from 'react';
import type { MockUser, UserRole } from '@/features/auth/mockUsers';
import type { CartItem, InvoiceSettings, Order } from '@/types';

export interface POSContextType {
  currentUser: MockUser;
  currentRole: UserRole;
  cart: CartItem[];
  orders: Order[];
  ordersLoading: boolean;
  ordersError: string | null;
  invoiceSettings: InvoiceSettings;
  invoiceOrder: Order | null;
  selectedTable: string;
  selectedCategory: string;
  subtotal: number;
  setCurrentRole: (role: UserRole) => void;
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
