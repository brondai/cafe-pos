export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  popular?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'active' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'qr';
  createdAt: string;
  customerName?: string;
}

export type InvoiceTemplate = 'classic' | 'compact' | 'modern';

export interface InvoiceSettings {
  storeName: string;
  address: string;
  phone: string;
  invoiceTitle: string;
  taxRate: number;
  currencySymbol: string;
  footerMessage: string;
  template: InvoiceTemplate;
  autoPrint: boolean;
}

export interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved';
  seats: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
