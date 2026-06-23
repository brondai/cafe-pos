import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActiveOrdersList } from '@/features/orders/components/ActiveOrdersList';
import { EditableOrderMenu } from '@/features/orders/components/EditableOrderMenu';
import { MobileOrderControls } from '@/features/orders/components/MobileOrderControls';
import { OrderDetailsPanel } from '@/features/orders/components/OrderDetailsPanel';
import { useOrderDraft } from '@/features/orders/hooks/useOrderDraft';
import {
  tableSortValue,
} from '@/features/orders/utils/orderUtils';
import { hasRoleAccess } from '@/features/auth/mockUsers';
import { CategoryTabs } from '@/features/pos/components/CategoryTabs';
import { MenuGrid } from '@/features/pos/components/MenuGrid';
import { OrderPanel } from '@/features/pos/components/OrderPanel';
import { usePOS } from '@/hooks/usePOS';
import { ArrowLeft, Search } from 'lucide-react';

export function OrdersPage() {
  const {
    currentRole,
    orders,
    updateOrderItems,
    chargeOrder,
    updateOrderStatus,
    searchQuery: posSearchQuery,
    setSearchQuery: setPosSearchQuery,
  } = usePOS();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategory, setMenuCategory] = useState('all');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);
  const canAdjustActiveOrders = hasRoleAccess(currentRole, 'adjustActiveOrders');
  const canCancelOrders = hasRoleAccess(currentRole, 'cancelOrders');

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;
  const isEditingActiveOrder = selectedOrder?.status === 'active';

  const closeOrder = () => {
    setSelectedOrderId(null);
    setIsCreatingOrder(false);
    setShowPaymentOptions(false);
    setIsMobileOrderOpen(false);
    orderDraft.clearDraft();
  };

  const orderDraft = useOrderDraft({
    selectedOrder,
    isEditingActiveOrder,
    updateOrderItems,
    chargeOrder,
    onSave: closeOrder,
    onCharge: () => {
      setShowPaymentOptions(false);
      setIsMobileOrderOpen(false);
    },
  });

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => order.status === 'active')
      .filter((order) => {
        if (!searchQuery) return true;
        const normalizedQuery = searchQuery.toLowerCase();

        return (
          order.tableNumber.includes(normalizedQuery) ||
          (order.customerName?.toLowerCase().includes(normalizedQuery) ?? false)
        );
      })
      .sort((a, b) => {
        const tableDifference =
          tableSortValue(a.tableNumber) - tableSortValue(b.tableNumber);

        if (tableDifference !== 0) return tableDifference;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [orders, searchQuery]);

  const openOrder = (orderId: string) => {
    const order = orders.find((currentOrder) => currentOrder.id === orderId);

    setSelectedOrderId(orderId);
    setIsCreatingOrder(false);
    setMenuSearchQuery('');
    setMenuCategory('all');
    setShowPaymentOptions(false);
    setIsMobileOrderOpen(false);
    orderDraft.loadOrderDraft(order);
  };

  const startNewOrder = () => {
    setSelectedOrderId(null);
    setIsCreatingOrder(true);
    setMenuSearchQuery('');
    setMenuCategory('all');
    setPosSearchQuery('');
    setShowPaymentOptions(false);
    setIsMobileOrderOpen(false);
    orderDraft.clearDraft();
  };

  const printSelectedOrder = () => {
    if (selectedOrder?.paymentMethod) {
      chargeOrder(selectedOrder, selectedOrder.paymentMethod);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {isCreatingOrder ? (
          <NewOrderMenu
            searchQuery={posSearchQuery}
            onSearchChange={setPosSearchQuery}
            onBack={closeOrder}
          />
        ) : isEditingActiveOrder ? (
          <EditableOrderMenu
            searchQuery={menuSearchQuery}
            category={menuCategory}
            draftItems={orderDraft.draftItems}
            onSearchChange={setMenuSearchQuery}
            onCategoryChange={setMenuCategory}
            onBack={closeOrder}
            onAddItem={orderDraft.addDraftItem}
            onUpdateItemQuantity={orderDraft.updateDraftItemQuantity}
          />
        ) : (
          <ActiveOrdersList
            orders={visibleOrders}
            searchQuery={searchQuery}
            selectedOrderId={selectedOrderId}
            onSearchChange={setSearchQuery}
            onNewOrder={startNewOrder}
            onOpenOrder={openOrder}
            onCancelOrder={(orderId) => updateOrderStatus(orderId, 'cancelled')}
            canCancelOrders={canCancelOrders}
          />
        )}
      </div>

      {isCreatingOrder ? (
        <OrderPanel />
      ) : selectedOrder ? (
        <>
          <OrderDetailsPanel
            order={selectedOrder}
            items={orderDraft.panelItems}
            subtotal={orderDraft.panelSubtotal}
            total={orderDraft.panelTotal}
            isEditingActiveOrder={Boolean(isEditingActiveOrder && canAdjustActiveOrders)}
            canSaveChanges={canAdjustActiveOrders}
            showPaymentOptions={showPaymentOptions}
            onClose={closeOrder}
            onSave={orderDraft.saveDraftOrder}
            onCharge={orderDraft.chargePanelOrder}
            onPrintInvoice={printSelectedOrder}
            onShowPaymentOptionsChange={setShowPaymentOptions}
            onRemoveItem={orderDraft.removeDraftItem}
            onUpdateItemQuantity={orderDraft.updateDraftItemQuantity}
          />

          <MobileOrderControls
            order={selectedOrder}
            items={orderDraft.panelItems}
            itemCount={orderDraft.panelItemCount}
            subtotal={orderDraft.panelSubtotal}
            total={orderDraft.panelTotal}
            open={isMobileOrderOpen}
            showPaymentOptions={showPaymentOptions}
            canSaveChanges={canAdjustActiveOrders}
            onOpenChange={setIsMobileOrderOpen}
            onShowPaymentOptionsChange={setShowPaymentOptions}
            onSave={orderDraft.saveDraftOrder}
            onCharge={orderDraft.chargePanelOrder}
            onRemoveItem={orderDraft.removeDraftItem}
            onUpdateItemQuantity={orderDraft.updateDraftItemQuantity}
          />
        </>
      ) : null}
    </div>
  );
}

function NewOrderMenu({
  searchQuery,
  onSearchChange,
  onBack,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="bg-white px-3 py-2 border-b border-gray-200 flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0"
          onClick={onBack}
          aria-label="Back to orders"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>

      <CategoryTabs />
      <MenuGrid />
    </>
  );
}
