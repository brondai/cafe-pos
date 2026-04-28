import { Button } from '@/components/ui/button';
import { CreditCard, Save } from 'lucide-react';

interface OrderPanelActionsProps {
  onSave: () => void;
  onCharge: () => void;
  onClear: () => void;
}

export function OrderPanelActions({
  onSave,
  onCharge,
  onClear,
}: OrderPanelActionsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
          onClick={onSave}
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
        <Button className="h-11 bg-violet-600 hover:bg-violet-700" onClick={onCharge}>
          <CreditCard className="mr-2 h-4 w-4" />
          Charge
        </Button>
      </div>
      <Button
        variant="ghost"
        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={onClear}
      >
        Clear Order
      </Button>
    </>
  );
}
