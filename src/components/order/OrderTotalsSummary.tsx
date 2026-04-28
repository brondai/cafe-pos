import { Separator } from '@/components/ui/separator';

interface OrderTotalsSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  textSize?: 'sm' | 'base';
}

export function OrderTotalsSummary({
  subtotal,
  tax,
  total,
  taxRate,
  textSize = 'sm',
}: OrderTotalsSummaryProps) {
  const textClass = textSize === 'sm' ? 'text-sm' : '';

  return (
    <div className={`space-y-2 ${textClass}`}>
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Tax ({taxRate}%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <Separator />
      <div className="flex justify-between text-lg font-bold text-gray-900">
        <span>Total</span>
        <span className="text-violet-700">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
