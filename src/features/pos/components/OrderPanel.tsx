import { Button } from '@/components/ui/button';
import { CartItemsList } from '@/features/pos/components/CartItemsList';
import { CustomOrderForm } from '@/features/pos/components/CustomOrderForm';
import { DesktopOrderPanel } from '@/features/pos/components/OrderPanelLayout';
import { InstantSaleForm } from '@/features/pos/components/InstantSaleForm';
import { MobileOrderPanel } from '@/features/pos/components/MobileOrderPanel';
import { OrderPanelActions } from '@/features/pos/components/OrderPanelActions';
import { OrderPanelTotals } from '@/features/pos/components/OrderPanelTotals';
import { TableSavePicker } from '@/features/pos/components/TableSavePicker';
import { useOrderPanelState } from '@/features/pos/hooks/useOrderPanelState';
import { usePOS } from '@/hooks/usePOS';
import { CreditCard } from 'lucide-react';

export function OrderPanel() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    chargeOrder,
    invoiceSettings,
    subtotal,
    selectedTable,
    setSelectedTable,
  } = usePOS();

  const panel = useOrderPanelState({
    cart,
    invoiceSettings,
    subtotal,
    selectedTable,
    setSelectedTable,
    placeOrder,
    chargeOrder,
  });

  if (cart.length === 0) {
    return null;
  }

  const body =
    panel.mode === 'cart' ? (
      <CartItemsList
        cart={cart}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    ) : panel.mode === 'save' ? (
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

  const footer =
    panel.mode === 'cart' ? (
      <>
        <OrderPanelTotals
          subtotal={subtotal}
          tax={panel.tax}
          total={panel.total}
          taxRate={invoiceSettings.taxRate}
        />
        <OrderPanelActions
          onSave={panel.openSaveMode}
          onCharge={panel.openInstantCharge}
          onClear={clearCart}
        />
      </>
    ) : panel.mode === 'instant' ? (
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

  return (
    <>
      <DesktopOrderPanel
        title={panel.title}
        description={panel.description}
        body={body}
        footer={footer}
      />
      <MobileOrderPanel
        title={panel.title}
        description={panel.description}
        cartCount={panel.cartCount}
        total={panel.total}
        body={body}
        footer={footer}
        open={panel.isMobilePanelOpen}
        drawerOpen={panel.mode !== 'cart'}
        onOpenChange={panel.handleMobileOpenChange}
        onOpenCart={panel.openMobileCart}
        onSave={panel.openSaveMode}
        onCharge={panel.openInstantCharge}
      />
    </>
  );
}
