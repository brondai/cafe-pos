import { Banknote, CreditCard, QrCode } from 'lucide-react';

export type PaymentMethod = 'cash' | 'card' | 'qr';

export const paymentMethodOptions: Array<{
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}> = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'qr', label: 'QR Code', icon: QrCode },
];
