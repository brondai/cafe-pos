import { Separator } from '@/components/ui/separator';
import type { InvoiceSettings, Order } from '@/types';

interface InvoiceTemplateProps {
  order: Order;
  settings: InvoiceSettings;
  printTarget?: boolean;
}

const templateStyles = {
  classic: {
    wrapper: 'border border-gray-300 bg-white text-gray-950',
    header: 'text-center',
    accent: 'border-gray-900',
    title: 'font-serif text-xl tracking-wide',
    badge: 'border border-gray-300 text-gray-700',
  },
  compact: {
    wrapper: 'border border-gray-200 bg-white text-gray-950',
    header: 'text-left',
    accent: 'border-dashed border-gray-300',
    title: 'text-lg font-bold',
    badge: 'border border-gray-200 text-gray-600',
  },
  modern: {
    wrapper: 'border border-stone-200 bg-stone-50 text-slate-950',
    header: 'text-left',
    accent: 'border-teal-700',
    title: 'text-xl font-bold',
    badge: 'border border-teal-200 bg-teal-50 text-teal-800',
  },
};

function money(value: number, symbol: string) {
  return `${symbol}${value.toFixed(2)}`;
}

function getOrderLabel(order: Order) {
  if (order.tableNumber === 'Instant') return order.customerName || 'Instant Order';
  if (order.tableNumber === 'Custom' && order.customerName) return order.customerName;
  return `Table ${order.tableNumber}`;
}

export function InvoiceTemplate({
  order,
  settings,
  printTarget = false,
}: InvoiceTemplateProps) {
  const orderDate = new Date(order.createdAt);
  const styles = templateStyles[settings.template];
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article
      data-print-invoice={printTarget ? 'true' : undefined}
      className={`mx-auto w-full max-w-[360px] rounded-lg p-5 shadow-sm ${styles.wrapper}`}
    >
      <header className={`space-y-2 ${styles.header}`}>
        <div>
          <p className={styles.title}>{settings.storeName}</p>
          <p className="mt-1 text-xs leading-relaxed text-gray-600">
            {settings.address}
          </p>
          <p className="text-xs text-gray-600">{settings.phone}</p>
        </div>
        <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles.badge}`}>
          {settings.invoiceTitle}
        </div>
      </header>

      <Separator className={`my-4 border-t ${styles.accent}`} />

      <section className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-500">Invoice No.</p>
          <p className="font-semibold text-gray-950">{order.id}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-500">Order</p>
          <p className="font-semibold text-gray-950">{getOrderLabel(order)}</p>
        </div>
        <div>
          <p className="text-gray-500">Date</p>
          <p className="font-semibold text-gray-950">
            {orderDate.toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-500">Time</p>
          <p className="font-semibold text-gray-950">
            {orderDate.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {order.customerName && (
          <div className="col-span-2">
            <p className="text-gray-500">Customer</p>
            <p className="font-semibold text-gray-950">{order.customerName}</p>
          </div>
        )}
      </section>

      <div className="my-4 overflow-hidden rounded-md border border-gray-200">
        <div className="grid grid-cols-[1fr_42px_70px] bg-gray-100 px-3 py-2 text-[11px] font-semibold uppercase text-gray-600">
          <span>Item</span>
          <span className="text-center">Qty</span>
          <span className="text-right">Amount</span>
        </div>
        {order.items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_42px_70px] border-t border-gray-100 px-3 py-2 text-xs"
          >
            <div className="min-w-0">
              <p className="font-medium text-gray-950">{item.name}</p>
              <p className="text-[11px] text-gray-500">
                {money(item.price, settings.currencySymbol)} each
              </p>
            </div>
            <span className="text-center font-medium text-gray-700">
              {item.quantity}
            </span>
            <span className="text-right font-semibold text-gray-950">
              {money(item.price * item.quantity, settings.currencySymbol)}
            </span>
          </div>
        ))}
      </div>

      <section className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{money(order.subtotal, settings.currencySymbol)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax ({settings.taxRate}%)</span>
          <span>{money(order.tax, settings.currencySymbol)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-base font-bold text-gray-950">
          <span>Total</span>
          <span>{money(order.total, settings.currencySymbol)}</span>
        </div>
        {order.paymentMethod && (
          <div className="flex justify-between text-xs capitalize text-gray-500">
            <span>Payment</span>
            <span>{order.paymentMethod}</span>
          </div>
        )}
      </section>

      <footer className="mt-5 space-y-2 text-center">
        <p className="text-xs text-gray-600">{settings.footerMessage}</p>
        <p className="text-[11px] text-gray-400">
          {itemCount} item{itemCount === 1 ? '' : 's'} served
        </p>
      </footer>
    </article>
  );
}
