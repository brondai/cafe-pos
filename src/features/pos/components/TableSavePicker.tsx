import { tables } from '@/data/menuData';
import { getStatusColor, getStatusDot } from '@/features/pos/utils/tableStyles';

interface TableSavePickerProps {
  onSelectTable: (tableNumber: string) => void;
  onCustomOrder: () => void;
}

export function TableSavePicker({
  onSelectTable,
  onCustomOrder,
}: TableSavePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {tables.map((table) => (
        <button
          key={table.id}
          type="button"
          onClick={() => onSelectTable(table.number)}
          className={`relative rounded-lg border-2 p-3 text-center transition-all ${getStatusColor(table.status)}`}
        >
          <div className="text-lg font-bold">{table.number}</div>
          <div className="text-[10px] opacity-70">{table.seats} seats</div>
          <span
            className={`absolute right-1 top-1 h-2 w-2 rounded-full ${getStatusDot(table.status)}`}
          />
        </button>
      ))}
      <button
        type="button"
        onClick={onCustomOrder}
        className="rounded-lg border-2 border-gray-200 p-3 text-center text-gray-700 transition-all hover:border-violet-600 hover:bg-violet-50 hover:text-violet-700"
      >
        <div className="text-sm font-bold">Custom</div>
        <div className="text-[10px] opacity-70">manual</div>
      </button>
    </div>
  );
}
