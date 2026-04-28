import { Button } from '@/components/ui/button';
import { CreditCard, Save } from 'lucide-react';

interface MobileCheckoutBarProps {
  title: string;
  itemCount: number;
  total: number;
  onOpenSummary: () => void;
  onSave: () => void;
  onCharge: () => void;
  chargeDisabled?: boolean;
  layout?: 'stacked' | 'inline';
  summaryClassName?: string;
  className?: string;
}

export function MobileCheckoutBar({
  title,
  itemCount,
  total,
  onOpenSummary,
  onSave,
  onCharge,
  chargeDisabled = false,
  layout = 'stacked',
  summaryClassName = '',
  className = '',
}: MobileCheckoutBarProps) {
  const summary = (
    <button
      type="button"
      className={`flex h-12 min-w-0 items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 text-left ${summaryClassName}`}
      onClick={onOpenSummary}
    >
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-gray-500">
          {title}
        </span>
        <span className="block truncate text-sm font-semibold text-gray-900">
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </span>
      </span>
      <span className="ml-2 shrink-0 text-sm font-bold text-violet-700">
        ${total.toFixed(2)}
      </span>
    </button>
  );

  const actions = (
    <>
      <Button
        variant="outline"
        className={
          layout === 'inline'
            ? 'h-12 w-20 border-violet-200 px-2 text-violet-700 hover:bg-violet-50'
            : 'h-11 border-violet-200 text-violet-700 hover:bg-violet-50'
        }
        onClick={onSave}
      >
        <Save className={layout === 'inline' ? 'mr-1 h-4 w-4' : 'mr-2 h-4 w-4'} />
        Save
      </Button>
      <Button
        className={
          layout === 'inline'
            ? 'h-12 w-24 bg-violet-600 px-2 hover:bg-violet-700'
            : 'h-11 bg-violet-600 hover:bg-violet-700'
        }
        onClick={onCharge}
        disabled={chargeDisabled}
      >
        <CreditCard
          className={layout === 'inline' ? 'mr-1 h-4 w-4' : 'mr-2 h-4 w-4'}
        />
        Charge
      </Button>
    </>
  );

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden ${className}`}
    >
      {layout === 'inline' ? (
        <div className="flex items-center gap-2">
          {summary}
          {actions}
        </div>
      ) : (
        <>
          {summary}
          <div className="grid grid-cols-2 gap-2">{actions}</div>
        </>
      )}
    </div>
  );
}
