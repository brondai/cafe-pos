import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Order } from '@/types';
import { Check, Printer, Clock, User, CreditCard } from 'lucide-react';

interface ReceiptModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptModal({ order, open, onClose }: ReceiptModalProps) {
  if (!order) return null;

  const orderDate = new Date(order.createdAt);
  const orderLabel =
    order.tableNumber === 'Instant'
      ? order.customerName || 'Instant Order'
      : order.tableNumber === 'Custom' && order.customerName
        ? order.customerName
        : `Table ${order.tableNumber}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
            <Check className="h-6 w-6 text-emerald-600" />
          </div>
          <DialogTitle className="text-lg">Order Confirmed</DialogTitle>
          <p className="text-sm text-gray-500">{order.id}</p>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="h-3.5 w-3.5" />
              <span>{orderLabel}</span>
            </div>
            {order.customerName && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-3.5 w-3.5" />
                <span>{order.customerName}</span>
              </div>
            )}
            {order.paymentMethod && (
              <div className="flex items-center gap-2 text-gray-600">
                <CreditCard className="h-3.5 w-3.5" />
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Order Items
            </h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
              <span>Total</span>
              <span className="text-violet-700">${order.total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
