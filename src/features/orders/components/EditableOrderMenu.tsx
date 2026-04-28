import { type ComponentType } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories, menuItems } from '@/data/menuData';
import type { CartItem } from '@/types';
import {
  ArrowLeft,
  Coffee,
  Croissant,
  CupSoda,
  Egg,
  GlassWater,
  Grid3X3,
  IceCream,
  Minus,
  Plus,
  Search,
  Star,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Grid3X3,
  Coffee,
  CupSoda,
  Croissant,
  Egg,
  UtensilsCrossed,
  IceCream,
  GlassWater,
};

interface EditableOrderMenuProps {
  searchQuery: string;
  category: string;
  draftItems: CartItem[];
  onSearchChange: (query: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onBack: () => void;
  onAddItem: (itemId: string) => void;
  onUpdateItemQuantity: (itemId: string, quantity: number) => void;
}

export function EditableOrderMenu({
  searchQuery,
  category,
  draftItems,
  onSearchChange,
  onCategoryChange,
  onBack,
  onAddItem,
  onUpdateItemQuantity,
}: EditableOrderMenuProps) {
  const filteredMenuItems = menuItems.filter((item) => {
    const normalizedQuery = searchQuery.toLowerCase();
    const matchesCategory = category === 'all' || item.category === category;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="bg-white px-3 py-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={onBack}
            aria-label="Back to orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-3 py-2 shrink-0">
        <div
          className="flex gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((categoryItem) => {
            const Icon = iconMap[categoryItem.icon] || Grid3X3;
            const isActive = category === categoryItem.id;

            return (
              <Button
                key={categoryItem.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(categoryItem.id)}
                className={`shrink-0 h-9 px-3 text-xs rounded-full transition-all ${
                  isActive
                    ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5 mr-1.5" />
                {categoryItem.name}
              </Button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 pb-36 sm:p-4 md:pb-24">
        {filteredMenuItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm">Try adjusting your search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {filteredMenuItems.map((item) => {
              const draftItem = draftItems.find(
                (selectedItem) => selectedItem.id === item.id
              );
              const quantity = draftItem?.quantity || 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                >
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
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-violet-700">
                        ${item.price.toFixed(2)}
                      </span>
                      <div className="flex items-center gap-2">
                        {quantity > 0 && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() =>
                              onUpdateItemQuantity(item.id, quantity - 1)
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            {quantity === 1 ? (
                              <Trash2 className="h-3.5 w-3.5" />
                            ) : (
                              <Minus className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => onAddItem(item.id)}
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
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
