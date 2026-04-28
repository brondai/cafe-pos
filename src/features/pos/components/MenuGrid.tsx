import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { menuItems } from '@/data/menuData';
import { usePOS } from '@/hooks/usePOS';
import { Star, Plus } from 'lucide-react';

export function MenuGrid() {
  const { selectedCategory, addToCart, searchQuery } = usePOS();

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-24 sm:p-4 md:pb-24">
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <p className="text-lg font-medium">No items found</p>
          <p className="text-sm">Try adjusting your search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={() => addToCart(item.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuCard({
  item,
  onAdd,
}: {
  item: (typeof menuItems)[0];
  onAdd: () => void;
}) {
  const { cart } = usePOS();
  const cartItem = cart.find((c) => c.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {item.name}
              </h3>
              {item.popular && (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0 h-4 shrink-0"
                >
                  <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500" />
                  Popular
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-violet-700">
            ${item.price.toFixed(2)}
          </span>
          <Button
            size="sm"
            onClick={onAdd}
            className="bg-violet-600 hover:bg-violet-700 h-8 px-3 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
            {quantity > 0 && (
              <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0 text-[10px]">
                {quantity}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
