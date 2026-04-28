import { Button } from '@/components/ui/button';
import {
  paymentMethodOptions,
  type PaymentMethod,
} from '@/components/order/paymentMethods';

interface PaymentMethodPickerProps {
  onSelect?: (paymentMethod: PaymentMethod) => void;
  selectedValue?: PaymentMethod;
  onSelectedValueChange?: (paymentMethod: PaymentMethod) => void;
  compactLabels?: boolean;
  buttonClassName?: string;
  optionClassName?: string;
}

export function PaymentMethodPicker({
  onSelect,
  selectedValue,
  onSelectedValueChange,
  compactLabels = false,
  buttonClassName = 'h-10',
  optionClassName = '',
}: PaymentMethodPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {paymentMethodOptions.map((option) => {
        const Icon = option.icon;
        const isActive = selectedValue === option.value;
        const label = compactLabels && option.value === 'qr' ? 'QR' : option.label;

        if (onSelectedValueChange) {
          return (
            <Button
              key={option.value}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              className={`${buttonClassName} ${
                isActive ? 'bg-violet-600 hover:bg-violet-700' : ''
              }`}
              onClick={() => onSelectedValueChange(option.value)}
            >
              <Icon className="mr-1.5 h-4 w-4" />
              {label}
            </Button>
          );
        }

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect?.(option.value)}
            className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-gray-200 p-3 text-gray-600 hover:border-violet-600 hover:bg-violet-50 hover:text-violet-700 ${optionClassName}`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
