import { OrderTotalsSummary } from '@/components/order/OrderTotalsSummary';

interface OrderPanelTotalsProps {
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}

export function OrderPanelTotals(props: OrderPanelTotalsProps) {
  return <OrderTotalsSummary {...props} />;
}
