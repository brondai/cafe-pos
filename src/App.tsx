import { Routes, Route } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { POSProvider } from '@/hooks/usePOS';
import { Layout } from '@/components/Layout';
import { POSPage } from '@/pages/POSPage';
import { CartPage } from '@/pages/CartPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { InvoicePrintDialog } from '@/components/InvoicePrintDialog';
import { usePOS } from '@/hooks/usePOS';

function AppContent() {
  const { invoiceOrder, invoiceSettings, dismissInvoice } = usePOS();

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<POSPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
      <InvoicePrintDialog
        order={invoiceOrder}
        settings={invoiceSettings}
        open={Boolean(invoiceOrder)}
        onOpenChange={(open) => {
          if (!open) dismissInvoice();
        }}
      />
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <POSProvider>
      <AppContent />
    </POSProvider>
  );
}

export default App;
