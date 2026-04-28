import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { tables } from '@/data/menuData';
import { usePOS } from '@/hooks/usePOS';
import {
  Banknote,
  CreditCard,
  Minus,
  Plus,
  QrCode,
  Save,
  Trash2,
  User,
} from 'lucide-react';

type PanelMode = 'cart' | 'save' | 'custom' | 'instant';
type PaymentMethod = 'cash' | 'card' | 'qr';

const paymentOptions: Array<{
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}> = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'qr', label: 'QR', icon: QrCode },
];

function getStatusColor(status: string) {
  switch (status) {
    case 'available':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
    case 'occupied':
      return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
    case 'reserved':
      return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

function getStatusDot(status: string) {
  switch (status) {
    case 'available':
      return 'bg-emerald-500';
    case 'occupied':
      return 'bg-red-500';
    case 'reserved':
      return 'bg-amber-500';
    default:
      return 'bg-gray-400';
  }
}

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
  const navigate = useNavigate();
  const [mode, setMode] = useState<PanelMode>('cart');
  const [pendingTable, setPendingTable] = useState(selectedTable);
  const [customOrderName, setCustomOrderName] = useState('');
  const [instantOrderName, setInstantOrderName] = useState('');
  const [instantPaymentMethod, setInstantPaymentMethod] =
    useState<PaymentMethod>('cash');

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );
  const tax = subtotal * (invoiceSettings.taxRate / 100);
  const total = subtotal + tax;

  useEffect(() => {
    if (cart.length === 0) {
      setMode('cart');
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

  const openInstantCharge = () => {
    setInstantOrderName(makeInstantOrderName());
    setInstantPaymentMethod('cash');
    setMode('instant');
  };

  const chargeInstantOrder = () => {
    const orderName = instantOrderName.trim() || makeInstantOrderName();
    const order = placeOrder(orderName, 'Instant');

    if (!order) return;

    chargeOrder(order, instantPaymentMethod);
    setMode('cart');
    setCustomOrderName('');
    setInstantOrderName('');
    navigate('/orders');
  };

  if (cart.length === 0) {
    return null;
  }

  if (mode === 'save' || mode === 'custom' || mode === 'instant') {
    return (
      <aside className="fixed inset-x-0 bottom-0 z-40 flex max-h-[72vh] w-full shrink-0 flex-col border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:static md:max-h-none md:w-[380px] md:border-l md:border-t-0 md:pb-0 md:shadow-none xl:w-[420px]">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            {mode === 'custom'
              ? 'Custom Order'
              : mode === 'instant'
                ? 'Instant Sale'
                : 'Select Table'}
          </h2>
          <p className="text-xs text-gray-500">
            {mode === 'custom'
              ? 'Place this order manually'
              : mode === 'instant'
                ? 'Name the sale and choose payment'
                : 'Choose a table to save the order'}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
          {mode === 'save' ? (
            <div className="grid grid-cols-4 gap-2">
              {tables.map((table) => (
                <button
                  key={table.id}
                  type="button"
                  onClick={() => completeOrder(table.number)}
                  className={`relative rounded-lg border-2 p-3 text-center transition-all ${getStatusColor(table.status)}`}
                >
                  <div className="text-lg font-bold">{table.number}</div>
                  <div className="text-[10px] opacity-70">{table.seats} seats</div>
                  <span
                    className={`absolute right-1 top-1 h-2 w-2 rounded-full ${getStatusDot(table.status)}`}
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMode('custom')}
                className="rounded-lg border-2 border-gray-200 p-3 text-center text-gray-700 transition-all hover:border-violet-600 hover:bg-violet-50 hover:text-violet-700"
              >
                <div className="text-sm font-bold">Custom</div>
                <div className="text-[10px] opacity-70">manual</div>
              </button>
            </div>
          ) : mode === 'custom' ? (
            <div className="space-y-3">
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Custom Order Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Enter a name or note"
                  value={customOrderName}
                  onChange={(event) => setCustomOrderName(event.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                className="h-11 w-full bg-violet-600 hover:bg-violet-700"
                onClick={() =>
                  completeOrder('Custom', customOrderName.trim() || undefined)
                }
              >
                <Save className="mr-2 h-4 w-4" />
                Place Custom Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  Sale Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={instantOrderName}
                    onChange={(event) => setInstantOrderName(event.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Payment Method
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = instantPaymentMethod === option.value;

                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={isActive ? 'default' : 'outline'}
                        className={`h-10 ${
                          isActive ? 'bg-violet-600 hover:bg-violet-700' : ''
                        }`}
                        onClick={() => setInstantPaymentMethod(option.value)}
                      >
                        <Icon className="mr-1.5 h-4 w-4" />
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-gray-200 bg-white p-4">
          {mode === 'instant' ? (
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setMode('cart')}
              >
                Back
              </Button>
              <Button
                className="h-11 bg-violet-600 hover:bg-violet-700"
                onClick={chargeInstantOrder}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Sale
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={() => setMode('cart')}
            >
              Back
            </Button>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex max-h-[72vh] w-full shrink-0 flex-col border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:static md:max-h-none md:w-[380px] md:border-l md:border-t-0 md:pb-0 md:shadow-none xl:w-[420px]">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Current Order</h2>
        <p className="text-xs text-gray-500">
          {cartCount} item{cartCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <div className="space-y-3">
          {cart.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-gray-200 bg-white p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                </div>
                <span className="text-sm font-semibold text-violet-700">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-7 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="shrink-0 space-y-3 border-t border-gray-200 bg-white p-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax ({invoiceSettings.taxRate}%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span className="text-violet-700">${total.toFixed(2)}</span>
          </div>
        </div>

        {mode === 'cart' ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
              onClick={() => setMode('save')}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button
              className="h-11 bg-violet-600 hover:bg-violet-700"
              onClick={openInstantCharge}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Charge
            </Button>
          </div>
        ) : (
          <Button variant="outline" className="h-11 w-full" onClick={() => setMode('cart')}>
            Back
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={clearCart}
        >
          Clear Order
        </Button>
      </div>
    </aside>
  );
}
