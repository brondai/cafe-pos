import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { menuItems } from '@/data/menuData';
import {
  getMockUserForRole,
  isUserRole,
  type UserRole,
} from '@/features/auth/mockUsers';
import type { CartItem, InvoiceSettings, Order } from '@/types';
import { POSContext } from '@/hooks/posContext';

const INVOICE_SETTINGS_KEY = 'cafe-pos-invoice-settings';
const MOCK_ROLE_KEY = 'cafe-pos-mock-role';

const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  storeName: 'The Brew Haven',
  address: '123 Coffee Lane, Downtown',
  phone: '(555) 123-4567',
  invoiceTitle: 'Tax Invoice',
  taxRate: 0,
  currencySymbol: '$',
  footerMessage: 'Thank you for visiting. Please come again.',
  template: 'classic',
  autoPrint: true,
};

function loadInvoiceSettings() {
  if (typeof window === 'undefined') return DEFAULT_INVOICE_SETTINGS;

  try {
    const saved = window.localStorage.getItem(INVOICE_SETTINGS_KEY);
    if (!saved) return DEFAULT_INVOICE_SETTINGS;

    return {
      ...DEFAULT_INVOICE_SETTINGS,
      ...JSON.parse(saved),
    } satisfies InvoiceSettings;
  } catch {
    return DEFAULT_INVOICE_SETTINGS;
  }
}

function loadMockRole(): UserRole {
  if (typeof window === 'undefined') return 'admin';

  const saved = window.localStorage.getItem(MOCK_ROLE_KEY);
  return saved && isUserRole(saved) ? saved : 'admin';
}

function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = 0;
  const total = subtotal;

  return { subtotal, tax, total };
}

export function POSProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>(loadMockRole);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(
    loadInvoiceSettings
  );
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [selectedTable, setSelectedTable] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useMemo(
    () => getMockUserForRole(currentRole),
    [currentRole]
  );

  useEffect(() => {
    window.localStorage.setItem(MOCK_ROLE_KEY, currentRole);
  }, [currentRole]);

  useEffect(() => {
    window.localStorage.setItem(
      INVOICE_SETTINGS_KEY,
      JSON.stringify(invoiceSettings)
    );
  }, [invoiceSettings]);

  const updateInvoiceSettings = useCallback(
    (settings: Partial<InvoiceSettings>) => {
      setInvoiceSettings((prev) => ({ ...prev, ...settings }));
    },
    []
  );

  const dismissInvoice = useCallback(() => {
    setInvoiceOrder(null);
  }, []);

  const addToCart = useCallback((itemId: string) => {
    const item = menuItems.find((m) => m.id === itemId);
    if (!item) return;

    setCart((prev) => {
      const existing = prev.find((c) => c.id === itemId);
      if (existing) {
        return prev.map((c) =>
          c.id === itemId ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => prev.filter((c) => c.id !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== itemId));
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.id === itemId ? { ...c, quantity } : c))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const placeOrder = useCallback(
    (customerName?: string, tableNumber?: string): Order | null => {
      if (cart.length === 0) return null;

      const totals = calculateTotals(cart);

      const order: Order = {
        id: `ORD-${Date.now()}`,
        tableNumber: tableNumber || selectedTable,
        items: [...cart],
        ...totals,
        status: 'active',
        createdAt: new Date().toISOString(),
        customerName,
      };

      setOrders((prev) => [order, ...prev]);
      setCart([]);
      return order;
    },
    [cart, selectedTable]
  );

  const updateOrderItems = useCallback(
    (orderId: string, items: CartItem[]) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId || order.status !== 'active') return order;

          return { ...order, items, ...calculateTotals(items) };
        })
      );
    },
    []
  );

  const chargeOrder = useCallback(
    (order: Order, paymentMethod: NonNullable<Order['paymentMethod']>) => {
      const paidOrder: Order = {
        ...order,
        status: 'completed',
        paymentMethod,
      };

      setOrders((prev) =>
        prev.map((currentOrder) =>
          currentOrder.id === paidOrder.id ? paidOrder : currentOrder
        )
      );
      setInvoiceOrder(paidOrder);
      return paidOrder;
    },
    []
  );

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <POSContext.Provider
      value={{
        currentUser,
        currentRole,
        cart,
        orders,
        invoiceSettings,
        invoiceOrder,
        selectedTable,
        selectedCategory,
        subtotal,
        setCurrentRole,
        updateInvoiceSettings,
        dismissInvoice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setSelectedTable,
        setSelectedCategory,
        placeOrder,
        updateOrderItems,
        chargeOrder,
        updateOrderStatus,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}
