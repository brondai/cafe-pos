import { Button } from '@/components/ui/button';
import { MobileCheckoutBar } from '@/components/order/MobileCheckoutBar';
import { PaymentMethodPicker } from '@/components/order/PaymentMethodPicker';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { PaymentMethod } from '@/features/orders/constants';
import {
  OrderItemsList,
  OrderTotals,
} from '@/features/orders/components/OrderDetailsPanel';
import { getOrderDisplayName } from '@/features/orders/utils/orderUtils';
import type { CartItem, InvoiceSettings, Order } from '@/types';

interface MobileOrderControlsProps {
  order: Order;
  invoiceSettings: InvoiceSettings;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  open: boolean;
  showPaymentOptions: boolean;
  onOpenChange: (open: boolean) => void;
  onShowPaymentOptionsChange: (show: boolean) => void;
  onSave: () => void;
  onCharge: (paymentMethod: PaymentMethod) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItemQuantity: (itemId: string, quantity: number) => void;
}

export function MobileOrderControls({
  order,
  invoiceSettings,
  items,
  itemCount,
  subtotal,
  tax,
  total,
  open,
  showPaymentOptions,
  onOpenChange,
  onShowPaymentOptionsChange,
  onSave,
  onCharge,
  onRemoveItem,
  onUpdateItemQuantity,
}: MobileOrderControlsProps) {
  if (order.status !== 'active') return null;

  return (
    <>
      <MobileCheckoutBar
        title="Selected Items"
        itemCount={itemCount}
        total={total}
        onOpenSummary={() => {
          onShowPaymentOptionsChange(false);
          onOpenChange(true);
        }}
        onSave={onSave}
        onCharge={() => {
          onShowPaymentOptionsChange(true);
          onOpenChange(true);
        }}
        chargeDisabled={items.length === 0}
        className="px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2"
        summaryClassName="mb-2 w-full"
      />

      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen);
          if (!nextOpen) {
            onShowPaymentOptionsChange(false);
          }
        }}
      >
        <DrawerContent className="max-h-[85vh] md:hidden">
          <DrawerHeader className="text-left">
            <DrawerTitle>
              {showPaymentOptions ? 'Payment Method' : getOrderDisplayName(order)}
            </DrawerTitle>
            <DrawerDescription>
              {itemCount} item{itemCount === 1 ? '' : 's'} &middot; $
              {total.toFixed(2)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
            {showPaymentOptions ? (
              <PaymentMethodPicker
                onSelect={onCharge}
                optionClassName="min-h-20"
              />
            ) : (
              <OrderItemsList
                items={items}
                isEditable
                onRemoveItem={onRemoveItem}
                onUpdateItemQuantity={onUpdateItemQuantity}
              />
            )}
          </div>

          <DrawerFooter className="border-t border-gray-200">
            {showPaymentOptions ? (
              <Button
                variant="outline"
                className="h-11"
                onClick={() => onShowPaymentOptionsChange(false)}
              >
                Back
              </Button>
            ) : (
              <>
                <OrderTotals
                  invoiceSettings={invoiceSettings}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
                    onClick={onSave}
                  >
                    Save
                  </Button>
                  <Button
                    className="h-11 bg-violet-600 hover:bg-violet-700"
                    onClick={() => onShowPaymentOptionsChange(true)}
                    disabled={items.length === 0}
                  >
                    Charge
                  </Button>
                </div>
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
