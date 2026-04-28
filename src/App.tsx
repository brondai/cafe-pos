import { Routes, Route, Navigate } from 'react-router';
import { Toaster } from '@/components/ui/sonner';
import { POSProvider } from '@/hooks/POSProvider';
import { Layout } from '@/components/Layout';
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
          <Route path="/" element={<Navigate to="/orders" replace />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/orders" replace />} />
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
