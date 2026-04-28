import { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';
import type { InvoiceSettings, Order } from '@/types';
import { Printer } from 'lucide-react';

interface InvoicePrintDialogProps {
  order: Order | null;
  settings: InvoiceSettings;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoicePrintDialog({
  order,
  settings,
  open,
  onOpenChange,
}: InvoicePrintDialogProps) {
  const autoPrintStarted = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !order || !settings.autoPrint) return;
    if (autoPrintStarted.current === order.id) return;

    autoPrintStarted.current = order.id;
    const timer = window.setTimeout(() => window.print(), 350);

    return () => window.clearTimeout(timer);
  }, [open, order, settings.autoPrint]);

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-md">
        <div className="invoice-print-hidden px-5 pt-5">
          <DialogHeader>
            <DialogTitle>Invoice Ready</DialogTitle>
            <DialogDescription>
              Review the invoice, then print it for the customer.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-5 py-4">
          <InvoiceTemplate order={order} settings={settings} printTarget />
        </div>

        <div className="invoice-print-hidden border-t border-gray-200 bg-white p-4">
          <Button
            className="h-11 w-full bg-violet-600 hover:bg-violet-700"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
