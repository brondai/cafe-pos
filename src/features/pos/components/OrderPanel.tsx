import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CartItemsList } from '@/features/pos/components/CartItemsList';
import { CustomOrderForm } from '@/features/pos/components/CustomOrderForm';
import { DesktopOrderPanel } from '@/features/pos/components/OrderPanelLayout';
import { InstantSaleForm } from '@/features/pos/components/InstantSaleForm';
import { MobileOrderPanel } from '@/features/pos/components/MobileOrderPanel';
import { OrderPanelActions } from '@/features/pos/components/OrderPanelActions';
import { OrderPanelTotals } from '@/features/pos/components/OrderPanelTotals';
import { TableSavePicker } from '@/features/pos/components/TableSavePicker';
import { useOrderPanelState } from '@/features/pos/hooks/useOrderPanelState';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePOS } from '@/hooks/usePOS';
import { CreditCard } from 'lucide-react';

export function OrderPanel() {
  const isMobile = useIsMobile();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    chargeOrder,
    subtotal,
    selectedTable,
    setSelectedTable,
  } = usePOS();

  const panel = useOrderPanelState({
    cart,
    subtotal,
    selectedTable,
    setSelectedTable,
    placeOrder,
    chargeOrder,
  });

  if (cart.length === 0) {
    return null;
  }

  const cartBody = (
    <CartItemsList
      cart={cart}
      onRemoveItem={removeFromCart}
      onUpdateQuantity={updateQuantity}
    />
  );

  const stepBody =
    panel.mode === 'save' ? (
      <TableSavePicker
        onSelectTable={(tableNumber) => panel.completeOrder(tableNumber)}
        onCustomOrder={() => panel.setMode('custom')}
      />
    ) : panel.mode === 'custom' ? (
      <CustomOrderForm
        value={panel.customOrderName}
        onChange={panel.setCustomOrderName}
        onSubmit={() =>
          panel.completeOrder('Custom', panel.customOrderName.trim() || undefined)
        }
      />
    ) : (
      <InstantSaleForm
        orderName={panel.instantOrderName}
        paymentMethod={panel.instantPaymentMethod}
        onOrderNameChange={panel.setInstantOrderName}
        onPaymentMethodChange={panel.setInstantPaymentMethod}
      />
    );

  const cartFooter = (
    <>
      <OrderPanelTotals subtotal={subtotal} total={panel.total} />
      <OrderPanelActions
        onSave={panel.openSaveMode}
        onCharge={panel.openInstantCharge}
        onClear={clearCart}
      />
    </>
  );

  const stepFooter =
    panel.mode === 'instant' ? (
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <Button variant="outline" className="h-11" onClick={panel.resetToCart}>
          Back
        </Button>
        <Button
          className="h-11 bg-violet-600 hover:bg-violet-700"
          onClick={panel.chargeInstantOrder}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Complete Sale
        </Button>
      </div>
    ) : (
      <Button
        variant="outline"
        className="h-11 w-full"
        onClick={panel.resetToCart}
      >
        Back
      </Button>
    );

  const mobileBody = panel.mode === 'cart' ? cartBody : stepBody;
  const mobileFooter = panel.mode === 'cart' ? cartFooter : stepFooter;
  const isStepOpen = panel.mode !== 'cart';

  return (
    <>
      <DesktopOrderPanel
        title="Current Order"
        description={`${panel.cartCount} item${panel.cartCount === 1 ? '' : 's'}`}
        body={cartBody}
        footer={cartFooter}
      />
      <Dialog
        open={!isMobile && isStepOpen}
        onOpenChange={(open) => {
          if (!open) {
            panel.resetToCart();
          }
        }}
      >
        <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-gray-200 px-5 py-4">
            <DialogTitle className="text-base">{panel.title}</DialogTitle>
            <DialogDescription>{panel.description}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto px-5 py-4">{stepBody}</div>
          <DialogFooter className="border-t border-gray-200 p-4">
            {stepFooter}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <MobileOrderPanel
        title={panel.title}
        description={panel.description}
        cartCount={panel.cartCount}
        total={panel.total}
        body={mobileBody}
        footer={mobileFooter}
        open={isMobile && panel.isMobilePanelOpen}
        drawerOpen={isMobile && isStepOpen}
        onOpenChange={panel.handleMobileOpenChange}
        onOpenCart={panel.openMobileCart}
        onSave={panel.openSaveMode}
        onCharge={panel.openInstantCharge}
      />
    </>
  );
}
