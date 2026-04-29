import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EditableItemList } from '@/components/order/EditableItemList';
import { OrderTotalsSummary } from '@/components/order/OrderTotalsSummary';
import { PaymentMethodPicker } from '@/components/order/PaymentMethodPicker';
import { statusConfig, type PaymentMethod } from '@/features/orders/constants';
import { getOrderDisplayName } from '@/features/orders/utils/orderUtils';
import type { CartItem, InvoiceSettings, Order } from '@/types';
import { CreditCard, Printer, Save, X } from 'lucide-react';

interface OrderDetailsPanelProps {
  order: Order;
  invoiceSettings: InvoiceSettings;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  isEditingActiveOrder: boolean;
  canSaveChanges: boolean;
  showPaymentOptions: boolean;
  onClose: () => void;
  onSave: () => void;
  onCharge: (paymentMethod: PaymentMethod) => void;
  onPrintInvoice: () => void;
  onShowPaymentOptionsChange: (show: boolean) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItemQuantity: (itemId: string, quantity: number) => void;
}

export function OrderDetailsPanel({
  order,
  invoiceSettings,
  items,
  subtotal,
  tax,
  total,
  isEditingActiveOrder,
  canSaveChanges,
  showPaymentOptions,
  onClose,
  onSave,
  onCharge,
  onPrintInvoice,
  onShowPaymentOptionsChange,
  onRemoveItem,
  onUpdateItemQuantity,
}: OrderDetailsPanelProps) {
  return (
    <aside className="hidden w-full shrink-0 flex-col border-t border-gray-200 bg-white md:flex md:w-[420px] md:border-l md:border-t-0">
      <OrderDetailsHeader order={order} onClose={onClose} />

      <OrderItemsList
        items={items}
        isEditable={isEditingActiveOrder}
        onRemoveItem={onRemoveItem}
        onUpdateItemQuantity={onUpdateItemQuantity}
      />

      <div className="shrink-0 space-y-3 border-t border-gray-200 bg-white p-4">
        <OrderTotals
          invoiceSettings={invoiceSettings}
          subtotal={subtotal}
          tax={tax}
          total={total}
        />

        {order.status === 'active' ? (
          <ActiveOrderActions
            hasItems={items.length > 0}
            canSaveChanges={canSaveChanges}
            showPaymentOptions={showPaymentOptions}
            onSave={onSave}
            onCharge={onCharge}
            onShowPaymentOptionsChange={onShowPaymentOptionsChange}
          />
        ) : (
          <CompletedOrderActions order={order} onPrintInvoice={onPrintInvoice} />
        )}
      </div>
    </aside>
  );
}

function OrderDetailsHeader({
  order,
  onClose,
}: {
  order: Order;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-900">
            {getOrderDisplayName(order)}
          </h2>
          <Badge variant="outline" className={statusConfig[order.status].color}>
            {statusConfig[order.status].label}
          </Badge>
        </div>
        {order.customerName && order.tableNumber !== 'Custom' && (
          <p className="text-xs text-gray-500 mt-0.5">{order.customerName}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-900"
        onClick={onClose}
        aria-label="Close order details"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function OrderItemsList({
  items,
  isEditable,
  onRemoveItem,
  onUpdateItemQuantity,
}: {
  items: CartItem[];
  isEditable: boolean;
  onRemoveItem: (itemId: string) => void;
  onUpdateItemQuantity: (itemId: string, quantity: number) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <EditableItemList
        items={items}
        editable={isEditable}
        onRemoveItem={onRemoveItem}
        onUpdateItemQuantity={onUpdateItemQuantity}
      />
    </div>
  );
}

export function OrderTotals({
  invoiceSettings,
  subtotal,
  tax,
  total,
}: {
  invoiceSettings: InvoiceSettings;
  subtotal: number;
  tax: number;
  total: number;
}) {
  return (
    <OrderTotalsSummary
      subtotal={subtotal}
      tax={tax}
      total={total}
      taxRate={invoiceSettings.taxRate}
    />
  );
}

function ActiveOrderActions({
  hasItems,
  canSaveChanges,
  showPaymentOptions,
  onSave,
  onCharge,
  onShowPaymentOptionsChange,
}: {
  hasItems: boolean;
  canSaveChanges: boolean;
  showPaymentOptions: boolean;
  onSave: () => void;
  onCharge: (paymentMethod: PaymentMethod) => void;
  onShowPaymentOptionsChange: (show: boolean) => void;
}) {
  if (showPaymentOptions) {
    return (
      <div className="space-y-2">
        <PaymentMethodPicker onSelect={onCharge} />
        <Button
          variant="outline"
          className="h-10 w-full"
          onClick={() => onShowPaymentOptionsChange(false)}
        >
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className={canSaveChanges ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
      {canSaveChanges ? (
        <Button
          variant="outline"
          className="h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
          onClick={onSave}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      ) : (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Manager access required to edit this saved order.
        </p>
      )}
      <Button
        className="h-11 bg-violet-600 hover:bg-violet-700"
        onClick={() => onShowPaymentOptionsChange(true)}
        disabled={!hasItems}
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Charge
      </Button>
    </div>
  );
}

function CompletedOrderActions({
  order,
  onPrintInvoice,
}: {
  order: Order;
  onPrintInvoice: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
        {order.paymentMethod ? `Paid by ${order.paymentMethod}` : 'Payment completed'}
      </div>
      {order.paymentMethod && (
        <Button
          variant="outline"
          className="h-11 w-full border-violet-200 text-violet-700 hover:bg-violet-50"
          onClick={onPrintInvoice}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      )}
    </div>
  );
}
