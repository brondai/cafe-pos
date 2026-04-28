import { useMemo, useState, type ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { CategoryTabs } from '@/components/CategoryTabs';
import { MenuGrid } from '@/components/MenuGrid';
import { OrderPanel } from '@/components/OrderPanel';
import { usePOS } from '@/hooks/usePOS';
import { categories, menuItems } from '@/data/menuData';
import type { Order } from '@/types';
import {
  ArrowLeft,
  Banknote,
  CheckCircle,
  Clock,
  Coffee,
  CreditCard,
  Croissant,
  CupSoda,
  Egg,
  GlassWater,
  Grid3X3,
  IceCream,
  Minus,
  Plus,
  Printer,
  QrCode,
  Save,
  Search,
  Star,
  Trash2,
  UtensilsCrossed,
  X,
  XCircle,
} from 'lucide-react';

type PaymentMethod = NonNullable<Order['paymentMethod']>;

const statusConfig = {
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
};

const paymentOptions: Array<{
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}> = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'qr', label: 'QR Code', icon: QrCode },
];

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Grid3X3,
  Coffee,
  CupSoda,
  Croissant,
  Egg,
  UtensilsCrossed,
  IceCream,
  GlassWater,
};

function tableSortValue(tableNumber: string) {
  const numericValue = Number.parseInt(tableNumber, 10);
  return Number.isNaN(numericValue) ? Number.MAX_SAFE_INTEGER : numericValue;
}

function getOrderDisplayName(order: Order) {
  if (order.tableNumber === 'Instant') {
    return order.customerName || 'Instant Order';
  }

  if (order.tableNumber === 'Custom' && order.customerName) {
    return order.customerName;
  }

  return `Table ${order.tableNumber}`;
}

export function OrdersPage() {
  const {
    orders,
    updateOrderItems,
    chargeOrder,
    updateOrderStatus,
    invoiceSettings,
    searchQuery: posSearchQuery,
    setSearchQuery: setPosSearchQuery,
  } = usePOS();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [menuCategory, setMenuCategory] = useState('all');
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [draftItems, setDraftItems] = useState<Order['items']>([]);
  const [isMobileOrderOpen, setIsMobileOrderOpen] = useState(false);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || null;
  const isEditingActiveOrder = selectedOrder?.status === 'active';

  const visibleOrders = useMemo(() => {
    return orders
      .filter((order) => order.status === 'active')
      .filter((order) => {
        if (!searchQuery) return true;
        const normalizedQuery = searchQuery.toLowerCase();

        return (
          order.tableNumber.includes(normalizedQuery) ||
          (order.customerName?.toLowerCase().includes(normalizedQuery) ?? false)
        );
      })
      .sort((a, b) => {
        const tableDifference =
          tableSortValue(a.tableNumber) - tableSortValue(b.tableNumber);

        if (tableDifference !== 0) return tableDifference;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [orders, searchQuery]);

  const filteredMenuItems = menuItems.filter((item) => {
    const normalizedQuery = menuSearchQuery.toLowerCase();
    const matchesCategory = menuCategory === 'all' || item.category === menuCategory;
    const matchesSearch =
      !menuSearchQuery ||
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.description.toLowerCase().includes(normalizedQuery);

    return matchesCategory && matchesSearch;
  });

  const draftSubtotal = draftItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const draftTax = draftSubtotal * (invoiceSettings.taxRate / 100);
  const draftTotal = draftSubtotal + draftTax;
  const panelItems = isEditingActiveOrder ? draftItems : selectedOrder?.items || [];
  const panelItemCount = panelItems.reduce((sum, item) => sum + item.quantity, 0);
  const panelSubtotal = isEditingActiveOrder ? draftSubtotal : selectedOrder?.subtotal || 0;
  const panelTax = isEditingActiveOrder ? draftTax : selectedOrder?.tax || 0;
  const panelTotal = isEditingActiveOrder ? draftTotal : selectedOrder?.total || 0;

  const addDraftItem = (itemId: string) => {
    const item = menuItems.find((menuItem) => menuItem.id === itemId);
    if (!item) return;

    setDraftItems((prev) => {
      const existingItem = prev.find((draftItem) => draftItem.id === itemId);

      if (existingItem) {
        return prev.map((draftItem) =>
          draftItem.id === itemId
            ? { ...draftItem, quantity: draftItem.quantity + 1 }
            : draftItem
        );
      }

      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateDraftItemQuantity = (itemId: string, quantity: number) => {
    setDraftItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.id !== itemId);
      }

      return prev.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const removeDraftItem = (itemId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const saveDraftOrder = () => {
    if (!selectedOrder || selectedOrder.status !== 'active') return;

    updateOrderItems(selectedOrder.id, draftItems);
    setIsMobileOrderOpen(false);
    closeOrder();
  };

  const chargePanelOrder = (paymentMethod: PaymentMethod) => {
    if (!selectedOrder) return;

    const orderToCharge: Order = isEditingActiveOrder
      ? {
          ...selectedOrder,
          items: draftItems,
          subtotal: draftSubtotal,
          tax: draftTax,
          total: draftTotal,
        }
      : selectedOrder;

    chargeOrder(orderToCharge, paymentMethod);
    setShowPaymentOptions(false);
    setDraftItems([]);
    setIsMobileOrderOpen(false);
  };

  const openOrder = (orderId: string) => {
    const order = orders.find((order) => order.id === orderId);

    setSelectedOrderId(orderId);
    setIsCreatingOrder(false);
    setMenuSearchQuery('');
    setMenuCategory('all');
    setShowPaymentOptions(false);
    setIsMobileOrderOpen(false);
    setDraftItems(order?.items.map((item) => ({ ...item })) || []);
  };

  const closeOrder = () => {
    setSelectedOrderId(null);
    setIsCreatingOrder(false);
    setShowPaymentOptions(false);
    setIsMobileOrderOpen(false);
    setDraftItems([]);
  };

  const startNewOrder = () => {
    setSelectedOrderId(null);
    setIsCreatingOrder(true);
    setMenuSearchQuery('');
    setMenuCategory('all');
    setPosSearchQuery('');
    setShowPaymentOptions(false);
    setIsMobileOrderOpen(false);
    setDraftItems([]);
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        {isCreatingOrder ? (
          <>
            <div className="bg-white px-3 py-2 border-b border-gray-200 flex items-center gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={closeOrder}
                aria-label="Back to orders"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search menu..."
                  value={posSearchQuery}
                  onChange={(event) => setPosSearchQuery(event.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            <CategoryTabs />
            <MenuGrid />
          </>
        ) : isEditingActiveOrder ? (
          <>
            <div className="bg-white px-3 py-2 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={closeOrder}
                  aria-label="Back to orders"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Search menu..."
                    value={menuSearchQuery}
                    onChange={(event) => setMenuSearchQuery(event.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border-b border-gray-200 px-3 py-2 shrink-0">
              <div
                className="flex gap-2 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => {
                  const Icon = iconMap[category.icon] || Grid3X3;
                  const isActive = menuCategory === category.id;

                  return (
                    <Button
                      key={category.id}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMenuCategory(category.id)}
                      className={`shrink-0 h-9 px-3 text-xs rounded-full transition-all ${
                        isActive
                          ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
                          : 'bg-white hover:bg-gray-50 text-gray-600 border-gray-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 mr-1.5" />
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 pb-36 sm:p-4 md:pb-24">
              {filteredMenuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <p className="text-lg font-medium">No items found</p>
                  <p className="text-sm">Try adjusting your search or category</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                  {filteredMenuItems.map((item) => {
                    const draftItem = draftItems.find(
                      (selectedItem) => selectedItem.id === item.id
                    );
                    const quantity = draftItem?.quantity || 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group"
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900 text-sm truncate">
                                  {item.name}
                                </h3>
                                {item.popular && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-50 text-amber-700 text-[10px] px-1.5 py-0 h-4 shrink-0"
                                  >
                                    <Star className="h-2.5 w-2.5 mr-0.5 fill-amber-500" />
                                    Popular
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <span className="text-lg font-bold text-violet-700">
                              ${item.price.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-2">
                              {quantity > 0 && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={() =>
                                    updateDraftItemQuantity(item.id, quantity - 1)
                                  }
                                  aria-label={`Remove ${item.name}`}
                                >
                                  {quantity === 1 ? (
                                    <Trash2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <Minus className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => addDraftItem(item.id)}
                                className="bg-violet-600 hover:bg-violet-700 h-8 px-3 text-xs"
                              >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                Add
                                {quantity > 0 && (
                                  <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0 text-[10px]">
                                    {quantity}
                                  </span>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="bg-white px-4 py-3 border-b border-gray-200 shrink-0 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by table or customer..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  className="h-10 bg-violet-600 hover:bg-violet-700"
                  onClick={startNewOrder}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {visibleOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <Clock className="h-12 w-12 mb-3 opacity-30" />
                  <p className="text-sm">No active orders</p>
                </div>
              ) : (
                visibleOrders.map((order) => {
                  const config = statusConfig[order.status];
                  const StatusIcon = config.icon;
                  const orderDate = new Date(order.createdAt);
                  const itemCount = order.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0
                  );
                  const isSelected = selectedOrderId === order.id;
                  const orderDisplayName = getOrderDisplayName(order);

                  return (
                    <div
                      key={order.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isSelected}
                      onClick={() => openOrder(order.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          openOrder(order.id);
                        }
                      }}
                      className={`w-full text-left bg-white rounded-xl border p-4 transition-all hover:shadow-sm hover:border-violet-200 ${
                        isSelected
                          ? 'border-violet-300 shadow-sm ring-1 ring-violet-100'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">
                              {orderDisplayName}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[10px] h-5 ${config.color}`}
                            >
                              <StatusIcon className="h-2.5 w-2.5 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {orderDate.toLocaleTimeString()} &middot; {itemCount} items
                            {order.customerName && order.tableNumber !== 'Custom'
                              ? ` &middot; ${order.customerName}`
                              : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-violet-700">
                            ${order.total.toFixed(2)}
                          </span>
                          {order.paymentMethod && (
                            <p className="text-[11px] text-gray-500 capitalize">
                              {order.paymentMethod}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mt-3 line-clamp-2">
                        {order.items.map((item, index) => (
                          <span key={item.id}>
                            {item.quantity}x {item.name}
                            {index < order.items.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </div>

                      {order.status === 'active' && (
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            onClick={(event) => {
                              event.stopPropagation();
                              updateOrderStatus(order.id, 'cancelled');
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {isCreatingOrder ? (
        <OrderPanel />
      ) : selectedOrder ? (
        <>
        <aside className="hidden w-full shrink-0 flex-col border-t border-gray-200 bg-white md:flex md:w-[420px] md:border-l md:border-t-0">
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">
                  {getOrderDisplayName(selectedOrder)}
                </h2>
                <Badge
                  variant="outline"
                  className={statusConfig[selectedOrder.status].color}
                >
                  {statusConfig[selectedOrder.status].label}
                </Badge>
              </div>
              {selectedOrder.customerName && selectedOrder.tableNumber !== 'Custom' && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedOrder.customerName}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-gray-500 hover:text-gray-900"
              onClick={closeOrder}
              aria-label="Close order details"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {panelItems.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 text-gray-400">
                <p className="text-sm">No items yet</p>
              </div>
            ) : (
              panelItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-violet-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  {isEditingActiveOrder && (
                    <div className="mt-3 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={() => removeDraftItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            updateDraftItemQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease ${item.name}`}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </Button>
                        <span className="w-7 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-full"
                          onClick={() =>
                            updateDraftItemQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase ${item.name}`}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="shrink-0 space-y-3 border-t border-gray-200 bg-white p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${panelSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax ({invoiceSettings.taxRate}%)</span>
                <span>${panelTax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-violet-700">
                  ${panelTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {selectedOrder.status === 'active' ? (
              <div className="space-y-3">
                {!showPaymentOptions ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
                      onClick={saveDraftOrder}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      className="h-11 bg-violet-600 hover:bg-violet-700"
                      onClick={() => setShowPaymentOptions(true)}
                      disabled={panelItems.length === 0}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Charge
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {paymentOptions.map((option) => {
                        const Icon = option.icon;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              chargePanelOrder(option.value);
                            }}
                            className="flex flex-col items-center gap-1 rounded-lg border-2 border-gray-200 p-3 text-gray-600 hover:border-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      className="h-10 w-full"
                      onClick={() => setShowPaymentOptions(false)}
                    >
                      Back
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                  {selectedOrder.paymentMethod
                    ? `Paid by ${selectedOrder.paymentMethod}`
                    : 'Payment completed'}
                </div>
                {selectedOrder.paymentMethod && (
                  <Button
                    variant="outline"
                    className="h-11 w-full border-violet-200 text-violet-700 hover:bg-violet-50"
                    onClick={() =>
                      chargeOrder(selectedOrder, selectedOrder.paymentMethod!)
                    }
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print Invoice
                  </Button>
                )}
              </div>
            )}
          </div>
        </aside>

        {selectedOrder.status === 'active' && (
          <>
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden">
              <button
                type="button"
                className="mb-2 flex h-12 w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 text-left"
                onClick={() => {
                  setShowPaymentOptions(false);
                  setIsMobileOrderOpen(true);
                }}
              >
                <span className="min-w-0">
                  <span className="block text-xs font-medium text-gray-500">
                    Selected Items
                  </span>
                  <span className="block truncate text-sm font-semibold text-gray-900">
                    {panelItemCount} item{panelItemCount === 1 ? '' : 's'}
                  </span>
                </span>
                <span className="shrink-0 text-base font-bold text-violet-700">
                  ${panelTotal.toFixed(2)}
                </span>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
                  onClick={saveDraftOrder}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  className="h-11 bg-violet-600 hover:bg-violet-700"
                  onClick={() => {
                    setShowPaymentOptions(true);
                    setIsMobileOrderOpen(true);
                  }}
                  disabled={panelItems.length === 0}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Charge
                </Button>
              </div>
            </div>

            <Drawer
              open={isMobileOrderOpen}
              onOpenChange={(open) => {
                setIsMobileOrderOpen(open);
                if (!open) {
                  setShowPaymentOptions(false);
                }
              }}
            >
              <DrawerContent className="max-h-[85vh] md:hidden">
                <DrawerHeader className="text-left">
                  <DrawerTitle>
                    {showPaymentOptions
                      ? 'Payment Method'
                      : getOrderDisplayName(selectedOrder)}
                  </DrawerTitle>
                  <DrawerDescription>
                    {panelItemCount} item{panelItemCount === 1 ? '' : 's'} &middot; $
                    {panelTotal.toFixed(2)}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 overflow-y-auto px-4 pb-2">
                  {showPaymentOptions ? (
                    <div className="grid grid-cols-3 gap-2">
                      {paymentOptions.map((option) => {
                        const Icon = option.icon;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => chargePanelOrder(option.value)}
                            className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-gray-200 p-3 text-gray-600 hover:border-violet-600 hover:bg-violet-50 hover:text-violet-700"
                          >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : panelItems.length === 0 ? (
                    <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 text-gray-400">
                      <p className="text-sm">No items yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {panelItems.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-gray-200 bg-white p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} x ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <span className="shrink-0 text-sm font-semibold text-violet-700">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                              onClick={() => removeDraftItem(item.id)}
                              aria-label={`Remove ${item.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() =>
                                  updateDraftItemQuantity(item.id, item.quantity - 1)
                                }
                                aria-label={`Decrease ${item.name}`}
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                              <span className="w-7 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() =>
                                  updateDraftItemQuantity(item.id, item.quantity + 1)
                                }
                                aria-label={`Increase ${item.name}`}
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <DrawerFooter className="border-t border-gray-200">
                  {showPaymentOptions ? (
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => setShowPaymentOptions(false)}
                    >
                      Back
                    </Button>
                  ) : (
                    <>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Subtotal</span>
                          <span>${panelSubtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Tax ({invoiceSettings.taxRate}%)</span>
                          <span>${panelTax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-violet-700">
                            ${panelTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="h-11 border-violet-200 text-violet-700 hover:bg-violet-50"
                          onClick={saveDraftOrder}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          className="h-11 bg-violet-600 hover:bg-violet-700"
                          onClick={() => setShowPaymentOptions(true)}
                          disabled={panelItems.length === 0}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Charge
                        </Button>
                      </div>
                    </>
                  )}
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </>
        )}
        </>
      ) : null}
    </div>
  );
}
