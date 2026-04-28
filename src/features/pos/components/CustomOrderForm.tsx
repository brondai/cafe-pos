import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, User } from 'lucide-react';

interface CustomOrderFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function CustomOrderForm({
  value,
  onChange,
  onSubmit,
}: CustomOrderFormProps) {
  return (
    <div className="space-y-3">
      <label className="mb-1.5 block text-xs font-medium text-gray-500">
        Custom Order Name
      </label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Enter a name or note"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
        />
      </div>
      <Button className="h-11 w-full bg-violet-600 hover:bg-violet-700" onClick={onSubmit}>
        <Save className="mr-2 h-4 w-4" />
        Place Custom Order
      </Button>
    </div>
  );
}
