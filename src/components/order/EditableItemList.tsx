import { Button } from '@/components/ui/button';
import type { CartItem } from '@/types';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface EditableItemListProps {
  items: CartItem[];
  emptyMessage?: string;
  itemPriceLabel?: 'each' | 'quantity';
  className?: string;
  editable?: boolean;
  onRemoveItem?: (itemId: string) => void;
  onUpdateItemQuantity?: (itemId: string, quantity: number) => void;
}

export function EditableItemList({
  items,
  emptyMessage = 'No items yet',
  itemPriceLabel = 'quantity',
  className = 'space-y-3',
  editable = true,
  onRemoveItem,
  onUpdateItemQuantity,
}: EditableItemListProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 text-gray-400">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">
                {itemPriceLabel === 'each'
                  ? `$${item.price.toFixed(2)} each`
                  : `${item.quantity} x $${item.price.toFixed(2)}`}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-violet-700">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>

          {editable && onRemoveItem && onUpdateItemQuantity && (
            <div className="mt-3 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={() => onRemoveItem(item.id)}
                aria-label={`Remove ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onUpdateItemQuantity(item.id, item.quantity - 1)}
                  aria-label={`Decrease ${item.name}`}
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
                  onClick={() => onUpdateItemQuantity(item.id, item.quantity + 1)}
                  aria-label={`Increase ${item.name}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
