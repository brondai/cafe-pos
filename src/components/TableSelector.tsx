import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { tables } from '@/data/menuData';
import { usePOS } from '@/hooks/usePOS';
import { Armchair } from 'lucide-react';
import { useState } from 'react';

export function TableSelector() {
  const { selectedTable, setSelectedTable } = usePOS();
  const [open, setOpen] = useState(false);

  const currentTable = tables.find((t) => t.number === selectedTable);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'occupied':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'reserved':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 text-xs">
          <Armchair className="h-4 w-4" />
          <span>Table {selectedTable}</span>
          <span
            className={`w-2 h-2 rounded-full ${getStatusDot(currentTable?.status || 'available')}`}
          />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Select Table</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {tables.map((table) => (
            <button
              key={table.id}
              onClick={() => {
                setSelectedTable(table.number);
                setOpen(false);
              }}
              className={`relative p-3 rounded-lg border-2 text-center transition-all ${
                selectedTable === table.number
                  ? 'border-violet-600 bg-violet-50'
                  : getStatusColor(table.status)
              }`}
            >
              <div className="text-lg font-bold">{table.number}</div>
              <div className="text-[10px] opacity-70">{table.seats} seats</div>
              <span
                className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusDot(table.status)}`}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Occupied
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Reserved
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
