import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  hasRoleAccess,
  MOCK_USERS,
  ROLE_LABELS,
  type RoleCapability,
  type UserRole,
} from '@/features/auth/mockUsers';
import { usePOS } from '@/hooks/usePOS';
import {
  ClipboardList,
  Settings,
  Coffee,
  Menu,
  LayoutDashboard,
  ChevronLeft,
  UserRound,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: typeof ClipboardList;
  capability: RoleCapability;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentRole, currentUser, setCurrentRole } = usePOS();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allNavItems: NavItem[] = [
    {
      path: '/orders',
      label: 'Orders',
      icon: ClipboardList,
      capability: 'viewOrders',
    },
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      capability: 'viewDashboard',
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
      capability: 'viewSettings',
    },
  ];

  const navItems = allNavItems.filter((item) =>
    hasRoleAccess(currentRole, item.capability)
  );

  const currentPage = allNavItems.find((n) => n.path === location.pathname);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);

    const activeRoute = allNavItems.find((item) => item.path === location.pathname);
    if (activeRoute && !hasRoleAccess(role, activeRoute.capability)) {
      navigate('/orders', { replace: true });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {location.pathname !== '/' && location.pathname !== '/orders' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigate('/')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Coffee className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                {currentPage?.label || 'Cafe POS'}
              </h1>
              <p className="text-[10px] text-gray-500 -mt-0.5">Point of Sale System</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={currentRole}
            onValueChange={(value) => handleRoleChange(value as UserRole)}
          >
            <SelectTrigger
              size="sm"
              className="h-9 w-[116px] border-gray-200 bg-gray-50 px-2 text-xs sm:w-[156px]"
              aria-label="Mock role"
            >
              <UserRound className="h-3.5 w-3.5 text-gray-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {MOCK_USERS.map((user) => (
                <SelectItem key={user.id} value={user.role}>
                  <span className="font-medium">{ROLE_LABELS[user.role]}</span>
                  <span className="hidden text-xs text-gray-500 sm:inline">
                    {user.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                    <Coffee className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-bold text-gray-900">Cafe POS</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {currentUser.title}: {currentUser.name}
                </p>
              </div>
              <nav className="p-2 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-violet-50 text-violet-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex bg-white border-b border-gray-200 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
