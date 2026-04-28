import { Input } from '@/components/ui/input';
import { PaymentMethodPicker } from '@/components/order/PaymentMethodPicker';
import type { PaymentMethod } from '@/features/pos/types';
import { User } from 'lucide-react';

interface InstantSaleFormProps {
  orderName: string;
  paymentMethod: PaymentMethod;
  onOrderNameChange: (value: string) => void;
  onPaymentMethodChange: (paymentMethod: PaymentMethod) => void;
}

export function InstantSaleForm({
  orderName,
  paymentMethod,
  onOrderNameChange,
  onPaymentMethodChange,
}: InstantSaleFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-500">
          Sale Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={orderName}
            onChange={(event) => onOrderNameChange(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-gray-500">Payment Method</p>
        <PaymentMethodPicker
          selectedValue={paymentMethod}
          onSelectedValueChange={onPaymentMethodChange}
          compactLabels
        />
      </div>
    </div>
  );
}
