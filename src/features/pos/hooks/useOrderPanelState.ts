import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import type { PaymentMethod, PanelMode } from '@/features/pos/types';
import type { CartItem, InvoiceSettings, Order } from '@/types';

interface UseOrderPanelStateOptions {
  cart: CartItem[];
  invoiceSettings: InvoiceSettings;
  subtotal: number;
  selectedTable: string;
  setSelectedTable: (table: string) => void;
  placeOrder: (customerName?: string, tableNumber?: string) => Order | null;
  chargeOrder: (
    order: Order,
    paymentMethod: NonNullable<Order['paymentMethod']>
  ) => Order;
}

export function useOrderPanelState({
  cart,
  invoiceSettings,
  subtotal,
  selectedTable,
  setSelectedTable,
  placeOrder,
  chargeOrder,
}: UseOrderPanelStateOptions) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<PanelMode>('cart');
  const [pendingTable, setPendingTable] = useState(selectedTable);
  const [customOrderName, setCustomOrderName] = useState('');
  const [instantOrderName, setInstantOrderName] = useState('');
  const [instantPaymentMethod, setInstantPaymentMethod] =
    useState<PaymentMethod>('cash');
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const tax = subtotal * (invoiceSettings.taxRate / 100);
  const total = subtotal + tax;

  useEffect(() => {
    if (cart.length === 0) {
      setMode('cart');
      setIsMobilePanelOpen(false);
    }
  }, [cart.length]);

  useEffect(() => {
    setPendingTable(selectedTable);
  }, [selectedTable]);

  const completeOrder = (tableNumber = pendingTable, customerName?: string) => {
    if (tableNumber !== 'Custom') {
      setSelectedTable(tableNumber);
    }

    const order = placeOrder(customerName, tableNumber);
    if (!order) return;

    setMode('cart');
    setIsMobilePanelOpen(false);
    setCustomOrderName('');
    navigate('/orders');
  };

  const makeInstantOrderName = () => {
    const time = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Instant Sale ${time}`;
  };

  const openSaveMode = () => {
    setMode('save');
    setIsMobilePanelOpen(true);
  };

  const openInstantCharge = () => {
    setInstantOrderName(makeInstantOrderName());
    setInstantPaymentMethod('cash');
    setMode('instant');
    setIsMobilePanelOpen(true);
  };

  const chargeInstantOrder = () => {
    const orderName = instantOrderName.trim() || makeInstantOrderName();
    const order = placeOrder(orderName, 'Instant');
    if (!order) return;

    chargeOrder(order, instantPaymentMethod);
    setMode('cart');
    setIsMobilePanelOpen(false);
    setCustomOrderName('');
    setInstantOrderName('');
    navigate('/orders');
  };

  const resetToCart = () => {
    setMode('cart');
  };

  const openMobileCart = () => {
    setMode('cart');
    setIsMobilePanelOpen(true);
  };

  const handleMobileOpenChange = (open: boolean) => {
    setIsMobilePanelOpen(open);
    if (!open && mode !== 'cart') {
      setMode('cart');
    }
  };

  const title =
    mode === 'custom'
      ? 'Custom Order'
      : mode === 'instant'
        ? 'Instant Sale'
        : mode === 'save'
          ? 'Select Table'
          : 'Current Order';

  const description =
    mode === 'custom'
      ? 'Place this order manually'
      : mode === 'instant'
        ? 'Name the sale and choose payment'
        : mode === 'save'
          ? 'Choose a table to save the order'
          : `${cartCount} item${cartCount === 1 ? '' : 's'}`;

  return {
    mode,
    setMode,
    customOrderName,
    setCustomOrderName,
    instantOrderName,
    setInstantOrderName,
    instantPaymentMethod,
    setInstantPaymentMethod,
    isMobilePanelOpen,
    cartCount,
    tax,
    total,
    title,
    description,
    completeOrder,
    openSaveMode,
    openInstantCharge,
    chargeInstantOrder,
    resetToCart,
    openMobileCart,
    handleMobileOpenChange,
  };
}
