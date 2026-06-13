import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceTemplate } from '@/components/InvoiceTemplate';
import { usePOS } from '@/hooks/usePOS';
import type { InvoiceTemplate as InvoiceTemplateName, Order } from '@/types';
import {
  Bell,
  Check,
  Database,
  Layers3,
  Package,
  Palette,
  Receipt,
  Save,
  Shield,
  Store,
  Tags,
} from 'lucide-react';
import { toast } from 'sonner';

type SettingsSection =
  | 'business'
  | 'invoice'
  | 'catalog'
  | 'operations'
  | 'data';

const settingsSections = [
  { id: 'business', label: 'Business', icon: Store },
  { id: 'invoice', label: 'Invoice', icon: Receipt },
  { id: 'catalog', label: 'Catalog', icon: Package },
  { id: 'operations', label: 'Operations', icon: Palette },
  { id: 'data', label: 'Data & Security', icon: Database },
] satisfies Array<{
  id: SettingsSection;
  label: string;
  icon: typeof Store;
}>;

export function SettingsPage() {
  const { invoiceSettings, updateInvoiceSettings } = usePOS();
  const [activeSection, setActiveSection] = useState<SettingsSection>('business');
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({
    soundEnabled: true,
    darkMode: false,
    notifications: true,
    compactView: false,
  });

  const previewOrder = useMemo<Order>(() => {
    const items = [
      {
        id: 'preview-latte',
        name: 'Caramel Latte',
        description: 'Preview item',
        category: 'coffee',
        price: 4.5,
        quantity: 2,
      },
      {
        id: 'preview-croissant',
        name: 'Butter Croissant',
        description: 'Preview item',
        category: 'bakery',
        price: 3.25,
        quantity: 1,
      },
    ];
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = 0;

    return {
      id: 'INV-PREVIEW',
      tableNumber: '4',
      items,
      subtotal,
      tax,
      total: subtotal,
      status: 'completed',
      paymentMethod: 'card',
      createdAt: new Date().toISOString(),
      customerName: 'Walk-in Guest',
    };
  }, []);

  const handleSave = () => {
    setSaved(true);
    toast.success('Settings saved');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-4 pb-20 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-gray-200 bg-white p-2 lg:sticky lg:top-4 lg:self-start">
          <nav className="grid gap-1 sm:grid-cols-5 lg:grid-cols-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 space-y-4">
          {activeSection === 'business' && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Store className="h-4 w-4" />
                  Business Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Store Name</Label>
                  <Input
                    value={invoiceSettings.storeName}
                    onChange={(event) =>
                      updateInvoiceSettings({ storeName: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={invoiceSettings.address}
                    onChange={(event) =>
                      updateInvoiceSettings({ address: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Phone</Label>
                    <Input
                      value={invoiceSettings.phone}
                      onChange={(event) =>
                        updateInvoiceSettings({ phone: event.target.value })
                      }
                    />
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === 'invoice' && (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Receipt className="h-4 w-4" />
                    Invoice & Printing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs">Template</Label>
                      <Select
                        value={invoiceSettings.template}
                        onValueChange={(value) =>
                          updateInvoiceSettings({
                            template: value as InvoiceTemplateName,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="classic">Classic</SelectItem>
                          <SelectItem value="compact">Compact</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Currency Symbol</Label>
                      <Input
                        value={invoiceSettings.currencySymbol}
                        onChange={(event) =>
                          updateInvoiceSettings({
                            currencySymbol: event.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Invoice Title</Label>
                    <Input
                      value={invoiceSettings.invoiceTitle}
                      onChange={(event) =>
                        updateInvoiceSettings({
                          invoiceTitle: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Footer Message</Label>
                    <Textarea
                      value={invoiceSettings.footerMessage}
                      onChange={(event) =>
                        updateInvoiceSettings({
                          footerMessage: event.target.value,
                        })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Auto Print Invoice</p>
                      <p className="text-xs text-gray-500">
                        Print after payment is done
                      </p>
                    </div>
                    <Switch
                      checked={invoiceSettings.autoPrint}
                      onCheckedChange={(checked) =>
                        updateInvoiceSettings({ autoPrint: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 xl:sticky xl:top-4 xl:self-start">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Receipt className="h-4 w-4" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <InvoiceTemplate order={previewOrder} settings={invoiceSettings} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'catalog' && (
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Package className="h-4 w-4" />
                  Catalog Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {[
                  { label: 'Items', icon: Package },
                  { label: 'Groups', icon: Layers3 },
                  { label: 'Categories', icon: Tags },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-gray-600">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.label}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="h-9 w-full justify-start text-sm"
                        disabled
                      >
                        Manage {item.label}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {activeSection === 'operations' && (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-gray-500">Use dark theme</p>
                    </div>
                    <Switch
                      checked={preferences.darkMode}
                      onCheckedChange={(checked) =>
                        setPreferences((value) => ({
                          ...value,
                          darkMode: checked,
                        }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Compact View</p>
                      <p className="text-xs text-gray-500">
                        Show more items per screen
                      </p>
                    </div>
                    <Switch
                      checked={preferences.compactView}
                      onCheckedChange={(checked) =>
                        setPreferences((value) => ({
                          ...value,
                          compactView: checked,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-xs text-gray-500">
                        Get alerts for new orders
                      </p>
                    </div>
                    <Switch
                      checked={preferences.notifications}
                      onCheckedChange={(checked) =>
                        setPreferences((value) => ({
                          ...value,
                          notifications: checked,
                        }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">Sound Effects</p>
                      <p className="text-xs text-gray-500">Play sounds on actions</p>
                    </div>
                    <Switch
                      checked={preferences.soundEnabled}
                      onCheckedChange={(checked) =>
                        setPreferences((value) => ({
                          ...value,
                          soundEnabled: checked,
                        }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Database className="h-4 w-4" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Database className="mr-2 h-4 w-4" />
                    Export Order Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Database className="mr-2 h-4 w-4" />
                    Backup Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Shield className="h-4 w-4" />
                    Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full justify-start text-sm">
                    <Shield className="mr-2 h-4 w-4" />
                    Change PIN
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              className={`h-11 min-w-40 text-sm font-semibold transition-all ${
                saved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {saved ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
