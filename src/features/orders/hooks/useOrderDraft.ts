import { useState } from 'react';
import { menuItems } from '@/data/menuData';
import type { CartItem, Order } from '@/types';
import type { PaymentMethod } from '@/features/orders/constants';
import { calculateItemTotals, getOrderItemCount } from '@/features/orders/utils/orderUtils';

interface UseOrderDraftOptions {
  selectedOrder: Order | null;
  isEditingActiveOrder: boolean;
  taxRate: number;
  updateOrderItems: (orderId: string, items: CartItem[]) => void;
  chargeOrder: (order: Order, paymentMethod: PaymentMethod) => Order;
  onSave: () => void;
  onCharge: () => void;
}

export function useOrderDraft({
  selectedOrder,
  isEditingActiveOrder,
  taxRate,
  updateOrderItems,
  chargeOrder,
  onSave,
  onCharge,
}: UseOrderDraftOptions) {
  const [draftItems, setDraftItems] = useState<Order['items']>([]);
  const draftTotals = calculateItemTotals(draftItems, taxRate);
  const panelItems = isEditingActiveOrder ? draftItems : selectedOrder?.items || [];
  const panelTotals = isEditingActiveOrder
    ? draftTotals
    : {
        subtotal: selectedOrder?.subtotal || 0,
        tax: selectedOrder?.tax || 0,
        total: selectedOrder?.total || 0,
      };
  const panelItemCount = getOrderItemCount(panelItems);

  const loadOrderDraft = (order: Order | null | undefined) => {
    setDraftItems(order?.items.map((item) => ({ ...item })) || []);
  };

  const clearDraft = () => {
    setDraftItems([]);
  };

  const addDraftItem = (itemId: string) => {
    const item = menuItems.find((menuItem) => menuItem.id === itemId);
    if (!item) return;

    setDraftItems((prev) => {
      const existingItem = prev.find((draftItem) => draftItem.id === itemId);

      if (existingItem) {
        return prev.map((draftItem) =>
          draftItem.id === itemId
            ? { ...draftItem, quantity: draftItem.quantity + 1 }
            : draftItem
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateDraftItemQuantity = (itemId: string, quantity: number) => {
    setDraftItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== itemId);
      }

      return prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const removeDraftItem = (itemId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const saveDraftOrder = () => {
    if (!selectedOrder || selectedOrder.status !== 'active') return;

    updateOrderItems(selectedOrder.id, draftItems);
    onSave();
  };

  const chargePanelOrder = (paymentMethod: PaymentMethod) => {
    if (!selectedOrder) return;

    const orderToCharge: Order = isEditingActiveOrder
      ? {
          ...selectedOrder,
          items: draftItems,
          ...draftTotals,
        }
      : selectedOrder;

    chargeOrder(orderToCharge, paymentMethod);
    clearDraft();
    onCharge();
  };

  return {
    draftItems,
    panelItems,
    panelItemCount,
    panelSubtotal: panelTotals.subtotal,
    panelTax: panelTotals.tax,
    panelTotal: panelTotals.total,
    loadOrderDraft,
    clearDraft,
    addDraftItem,
    updateDraftItemQuantity,
    removeDraftItem,
    saveDraftOrder,
    chargePanelOrder,
  };
}
