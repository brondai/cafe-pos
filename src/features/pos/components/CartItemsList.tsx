import { EditableItemList } from '@/components/order/EditableItemList';
import type { CartItem } from '@/types';

interface CartItemsListProps {
  cart: CartItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export function CartItemsList({
  cart,
  onRemoveItem,
  onUpdateQuantity,
}: CartItemsListProps) {
  return (
    <EditableItemList
      items={cart}
      itemPriceLabel="each"
      onRemoveItem={onRemoveItem}
      onUpdateItemQuantity={onUpdateQuantity}
    />
  );
}
