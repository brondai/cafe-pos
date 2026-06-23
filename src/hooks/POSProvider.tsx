import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { menuItems } from '@/data/menuData';
import {
  getMockUserForRole,
  isUserRole,
  type UserRole,
} from '@/features/auth/mockUsers';
import type { CartItem, InvoiceSettings, Order } from '@/types';
import { POSContext } from '@/hooks/posContext';
import { trpc } from '@/lib/trpc';
import {
  dbOrderToOrder,
  cartItemToCreateInput,
  toMinorUnits,
  type DbOrder,
} from '@/lib/orderAdapter';

const INVOICE_SETTINGS_KEY = 'cafe-pos-invoice-settings';
const MOCK_ROLE_KEY = 'cafe-pos-mock-role';
const LOCATION_ID =
  import.meta.env.VITE_LOCATION_ID ?? 'seed-location-keroneva';

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
  return { subtotal, tax: 0, total: subtotal };
}

export function POSProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>(loadMockRole);
  const [cart, setCart] = useState<CartItem[]>([]);
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

  // ── tRPC ──────────────────────────────────────────────────────────────────

  const utils = trpc.useUtils();

  const {
    data: activeOrdersData = [],
    isLoading: ordersLoading,
    error: ordersQueryError,
  } = trpc.order.listActive.useQuery(
    { locationId: LOCATION_ID },
    { staleTime: 30_000 }
  );

  const ordersError = ordersQueryError?.message ?? null;

  const orders: Order[] = useMemo(
    () => (activeOrdersData as DbOrder[]).map(dbOrderToOrder),
    [activeOrdersData]
  );

  const invalidateOrders = useCallback(() => {
    void utils.order.listActive.invalidate({ locationId: LOCATION_ID });
  }, [utils]);

  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: invalidateOrders,
  });
  const markPaidMutation = trpc.order.markPaid.useMutation({
    onSuccess: invalidateOrders,
  });
  const updateItemsMutation = trpc.order.updateItem.useMutation({
    onSuccess: invalidateOrders,
  });
  const addItemMutation = trpc.order.addItem.useMutation({
    onSuccess: invalidateOrders,
  });
  const removeItemMutation = trpc.order.removeItem.useMutation({
    onSuccess: invalidateOrders,
  });
  const markCompletedMutation = trpc.order.markCompleted.useMutation({
    onSuccess: invalidateOrders,
  });

  // ── Persistence effects ───────────────────────────────────────────────────

  useEffect(() => {
    window.localStorage.setItem(MOCK_ROLE_KEY, currentRole);
  }, [currentRole]);

  useEffect(() => {
    window.localStorage.setItem(
      INVOICE_SETTINGS_KEY,
      JSON.stringify(invoiceSettings)
    );
  }, [invoiceSettings]);

  // ── Invoice ───────────────────────────────────────────────────────────────

  const updateInvoiceSettings = useCallback(
    (settings: Partial<InvoiceSettings>) => {
      setInvoiceSettings((prev) => ({ ...prev, ...settings }));
    },
    []
  );

  const dismissInvoice = useCallback(() => {
    setInvoiceOrder(null);
  }, []);

  // ── Cart ──────────────────────────────────────────────────────────────────

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

  // ── Order operations ──────────────────────────────────────────────────────

  const placeOrder = useCallback(
    (customerName?: string, tableNumber?: string): Order | null => {
      if (cart.length === 0) return null;

      const totals = calculateTotals(cart);
      const table = tableNumber ?? selectedTable;

      // Optimistic local order so the UI navigates immediately; the DB write
      // happens in the background and the query refetch reconciles the id.
      const optimisticOrder: Order = {
        id: `optimistic-${Date.now()}`,
        tableNumber: table,
        items: [...cart],
        ...totals,
        status: 'active',
        createdAt: new Date().toISOString(),
        customerName,
      };

      createOrderMutation.mutate({
        locationId: LOCATION_ID,
        tableNumber: table,
        customerName,
        serviceMode: table === 'Instant' ? 'INSTANT' : table === 'Custom' ? 'CUSTOM' : 'DINE_IN',
        items: cart.map(cartItemToCreateInput),
        subtotalAmount: toMinorUnits(totals.subtotal),
        taxAmount: toMinorUnits(totals.tax),
        totalAmount: toMinorUnits(totals.total),
      });

      setCart([]);
      return optimisticOrder;
    },
    [cart, selectedTable, createOrderMutation]
  );

  const chargeOrder = useCallback(
    (order: Order, paymentMethod: NonNullable<Order['paymentMethod']>): Order => {
      const pmMap: Record<NonNullable<Order['paymentMethod']>, 'CASH' | 'CARD' | 'QR'> = {
        cash: 'CASH',
        card: 'CARD',
        qr: 'QR',
      };

      markPaidMutation.mutate({
        orderId: order.id,
        paymentMethod: pmMap[paymentMethod],
        totalAmount: toMinorUnits(order.total),
      });

      const paidOrder: Order = { ...order, status: 'completed', paymentMethod };
      setInvoiceOrder(paidOrder);
      return paidOrder;
    },
    [markPaidMutation]
  );

  const updateOrderItems = useCallback(
    (orderId: string, items: CartItem[]) => {
      // The draft editor sends a full replacement list. We reconcile against
      // the current DB order: add new items and update quantities on existing.
      const dbOrder = (activeOrdersData as DbOrder[]).find((o) => o.id === orderId);
      if (!dbOrder) return;

      const dbItemIds = new Set(dbOrder.items.map((i) => i.id));

      for (const item of items) {
        // item.id in a draft may be the menuItemId; match by menuItemId on db items
        const matching = dbOrder.items.find(
          (di) => di.menuItemId === item.id || di.id === item.id
        );

        if (matching) {
          if (matching.quantity !== item.quantity) {
            updateItemsMutation.mutate({
              orderId,
              itemId: matching.id,
              changes: { quantity: item.quantity },
            });
          }
          dbItemIds.delete(matching.id);
        } else {
          addItemMutation.mutate({
            orderId,
            item: cartItemToCreateInput(item),
          });
        }
      }

      // Any db items no longer in the draft should be removed
      for (const removedId of dbItemIds) {
        removeItemMutation.mutate({ orderId, itemId: removedId });
      }
    },
    [activeOrdersData, updateItemsMutation, addItemMutation, removeItemMutation]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order['status']) => {
      if (status === 'completed') {
        markCompletedMutation.mutate({ orderId });
      }
      // 'cancelled' and other statuses are handled by the backend separately
    },
    [markCompletedMutation]
  );

  // ── Derived ───────────────────────────────────────────────────────────────

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <POSContext.Provider
      value={{
        currentUser,
        currentRole,
        cart,
        orders,
        ordersLoading,
        ordersError,
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
