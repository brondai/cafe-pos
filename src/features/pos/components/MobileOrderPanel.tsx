import type { ReactNode } from 'react';
import { MobileCheckoutBar } from '@/components/order/MobileCheckoutBar';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface MobileOrderPanelProps {
  title: string;
  description: string;
  cartCount: number;
  total: number;
  body: ReactNode;
  footer: ReactNode;
  open: boolean;
  drawerOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenCart: () => void;
  onSave: () => void;
  onCharge: () => void;
}

export function MobileOrderPanel({
  title,
  description,
  cartCount,
  total,
  body,
  footer,
  open,
  drawerOpen,
  onOpenChange,
  onOpenCart,
  onSave,
  onCharge,
}: MobileOrderPanelProps) {
  return (
    <>
      <MobileCheckoutBar
        title="Current Order"
        itemCount={cartCount}
        total={total}
        onOpenSummary={onOpenCart}
        onSave={onSave}
        onCharge={onCharge}
        layout="inline"
        className="px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2"
        summaryClassName="flex-1"
      />

      <Drawer open={open || drawerOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[88vh] md:hidden">
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>
              {drawerOpen
                ? `${cartCount} item${cartCount === 1 ? '' : 's'} - $${total.toFixed(2)}`
                : description}
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">{body}</div>

          <DrawerFooter className="border-t border-gray-200">{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
