import { OrderTotalsSummary } from '@/components/order/OrderTotalsSummary';

interface OrderPanelTotalsProps {
  subtotal: number;
  total: number;
}

export function OrderPanelTotals(props: OrderPanelTotalsProps) {
  return <OrderTotalsSummary {...props} />;
}
