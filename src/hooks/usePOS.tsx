import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem, InvoiceSettings, Order } from '@/types';
import { menuItems, tables } from '@/data/menuData';

interface POSContextType {
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
  addItemToOrder: (orderId: string, itemId: string) => void;
  updateOrderItemQuantity: (orderId: string, itemId: string, quantity: number) => void;
  chargeOrder: (
    order: Order,
    paymentMethod: NonNullable<Order['paymentMethod']>
  ) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getTableStatus: (tableNumber: string) => 'available' | 'occupied' | 'reserved';
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const INVOICE_SETTINGS_KEY = 'cafe-pos-invoice-settings';

const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  storeName: 'The Brew Haven',
  address: '123 Coffee Lane, Downtown',
  phone: '(555) 123-4567',
  invoiceTitle: 'Tax Invoice',
  taxRate: 8,
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

function calculateTotals(items: CartItem[], taxRate: number) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return { subtotal, tax, total };
}

export function POSProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>(
    loadInvoiceSettings
  );
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [selectedTable, setSelectedTable] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

      const totals = calculateTotals(cart, invoiceSettings.taxRate);

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
    [cart, invoiceSettings.taxRate, selectedTable]
  );

  const addItemToOrder = useCallback((orderId: string, itemId: string) => {
    const item = menuItems.find((m) => m.id === itemId);
    if (!item) return;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || order.status !== 'active') return order;

        const existingItem = order.items.find((orderItem) => orderItem.id === itemId);
        const items = existingItem
          ? order.items.map((orderItem) =>
              orderItem.id === itemId
                ? { ...orderItem, quantity: orderItem.quantity + 1 }
                : orderItem
            )
          : [...order.items, { ...item, quantity: 1 }];

        return { ...order, items, ...calculateTotals(items, invoiceSettings.taxRate) };
      })
    );
  }, [invoiceSettings.taxRate]);

  const updateOrderItemQuantity = useCallback(
    (orderId: string, itemId: string, quantity: number) => {
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== orderId || order.status !== 'active') return order;

          const items =
            quantity <= 0
              ? order.items.filter((item) => item.id !== itemId)
              : order.items.map((item) =>
                  item.id === itemId ? { ...item, quantity } : item
                );

          return { ...order, items, ...calculateTotals(items, invoiceSettings.taxRate) };
        })
      );
    },
    [invoiceSettings.taxRate]
  );

  const chargeOrder = useCallback(
    (order: Order, paymentMethod: NonNullable<Order['paymentMethod']>) => {
      const paidOrder: Order = {
        ...order,
        status: 'completed',
        paymentMethod,
      };

      setOrders((prev) =>
        prev.map((order) =>
          order.id === paidOrder.id ? paidOrder : order
        )
      );
      setInvoiceOrder(paidOrder);
      return paidOrder;
    },
    []
  );

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  }, []);

  const getTableStatus = useCallback(
    (tableNumber: string) => {
      const table = tables.find((t) => t.number === tableNumber);
      return table?.status || 'available';
    },
    []
  );

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <POSContext.Provider
      value={{
        cart,
        orders,
        invoiceSettings,
        invoiceOrder,
        selectedTable,
        selectedCategory,
        subtotal,
        updateInvoiceSettings,
        dismissInvoice,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setSelectedTable,
        setSelectedCategory,
        placeOrder,
        addItemToOrder,
        updateOrderItemQuantity,
        chargeOrder,
        updateOrderStatus,
        getTableStatus,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
