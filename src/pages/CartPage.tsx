import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePOS } from '@/hooks/usePOS';
import { tables } from '@/data/menuData';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  User,
  Save,
  Armchair,
} from 'lucide-react';

export function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    invoiceSettings,
    subtotal,
    setSelectedTable,
  } = usePOS();
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [choosingTable, setChoosingTable] = useState(false);
  const [pendingTable, setPendingTable] = useState('1');

  const tax = subtotal * (invoiceSettings.taxRate / 100);
  const total = subtotal + tax;

  const handleSaveOrderClick = () => {
    setPendingTable('1');
    setChoosingTable(true);
  };

  const handleTableSelect = (tableNumber: string) => {
    setPendingTable(tableNumber);
  };

  const confirmTableAndPlaceOrder = () => {
    setSelectedTable(pendingTable);
    const order = placeOrder(customerName || undefined, pendingTable);
    if (order) {
      navigate('/orders');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      case 'occupied':
        return 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100';
      case 'reserved':
        return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-amber-500';
      default:
        return 'bg-gray-400';
    }
  };

  if (cart.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 px-4">
        <ShoppingBag className="h-16 w-16 mb-4 opacity-30" />
        <h2 className="text-lg font-semibold text-gray-600 mb-1">Your cart is empty</h2>
        <p className="text-sm mb-4">Add items from the menu to get started</p>
        <Button
          onClick={() => navigate('/')}
          className="bg-violet-600 hover:bg-violet-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="font-semibold text-gray-900">Order Summary</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {cart.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-gray-200 p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">${item.price.toFixed(2)} each</p>
              </div>
              <span className="font-semibold text-sm text-violet-700 ml-2">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => removeFromCart(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm font-medium">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Customer Name */}
        <div className="pt-2">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
            Customer Name (optional)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {choosingTable && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Armchair className="h-4 w-4 text-violet-600" />
              Select Table
            </div>
            <div className="grid grid-cols-4 gap-2">
              {tables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => handleTableSelect(table.number)}
                  className={`relative p-3 rounded-lg border-2 text-center transition-all ${
                    pendingTable === table.number
                      ? 'border-violet-600 bg-violet-50'
                      : getStatusColor(table.status)
                  }`}
                >
                  <div className="text-lg font-bold">{table.number}</div>
                  <div className="text-[10px] opacity-70">{table.seats} seats</div>
                  <span
                    className={`absolute top-1 right-1 w-2 h-2 rounded-full ${getStatusDot(table.status)}`}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 shrink-0 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tax ({invoiceSettings.taxRate}%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <span>Total</span>
          <span className="text-violet-700">${total.toFixed(2)}</span>
        </div>
        {choosingTable ? (
          <div className="grid grid-cols-[auto_1fr] gap-2">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => setChoosingTable(false)}
            >
              Back
            </Button>
            <Button
              onClick={confirmTableAndPlaceOrder}
              className="h-12 bg-violet-600 hover:bg-violet-700 text-base font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Table {pendingTable}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSaveOrderClick}
            className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-base font-semibold"
            disabled={cart.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Order
          </Button>
        )}
      </div>

    </div>
  );
}
