import { CategoryTabs } from '@/components/CategoryTabs';
import { MenuGrid } from '@/components/MenuGrid';
import { OrderPanel } from '@/components/OrderPanel';
import { Input } from '@/components/ui/input';
import { usePOS } from '@/hooks/usePOS';
import { Search } from 'lucide-react';

export function POSPage() {
  const { searchQuery, setSearchQuery } = usePOS();

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bg-white px-3 py-2 border-b border-gray-200 flex items-center gap-2 shrink-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>

        <CategoryTabs />
        <MenuGrid />
      </div>
      <OrderPanel />
    </div>
  );
}
