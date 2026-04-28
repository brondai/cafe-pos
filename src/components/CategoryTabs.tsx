import { Button } from '@/components/ui/button';
import { categories } from '@/data/menuData';
import { usePOS } from '@/hooks/usePOS';
import {
  Coffee,
  CupSoda,
  Croissant,
  Egg,
  UtensilsCrossed,
  IceCream,
  GlassWater,
  Grid3X3,
} from 'lucide-react';
import { useRef } from 'react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Grid3X3,
  Coffee,
  CupSoda,
  Croissant,
  Egg,
  UtensilsCrossed,
  IceCream,
  GlassWater,
};

export function CategoryTabs() {
  const { selectedCategory, setSelectedCategory } = usePOS();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white border-b border-gray-200 px-3 py-2 shrink-0">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || Grid3X3;
          const isActive = selectedCategory === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 h-9 px-3 text-xs rounded-full transition-all ${
                isActive
                  ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                  : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5 mr-1.5" />
              {cat.name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
