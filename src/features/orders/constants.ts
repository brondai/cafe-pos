import type { Order } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export type PaymentMethod = NonNullable<Order['paymentMethod']>;

export const statusConfig = {
  active: {
    label: 'Active',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
  },
} satisfies Record<
  Order['status'],
  {
    label: string;
    color: string;
    icon: typeof Clock;
  }
>;
