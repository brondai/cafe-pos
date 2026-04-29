export type UserRole = 'admin' | 'manager' | 'cashier';

export interface MockUser {
  id: string;
  name: string;
  role: UserRole;
  title: string;
}

export interface RoleCapabilities {
  viewOrders: boolean;
  viewDashboard: boolean;
  viewSettings: boolean;
  adjustActiveOrders: boolean;
  cancelOrders: boolean;
  editSettings: boolean;
  exportData: boolean;
}

export type RoleCapability = keyof RoleCapabilities;

export const MOCK_USERS: MockUser[] = [
  {
    id: 'mock-admin',
    name: 'Avery Chen',
    role: 'admin',
    title: 'Store Admin',
  },
  {
    id: 'mock-manager',
    name: 'Mina Patel',
    role: 'manager',
    title: 'Floor Manager',
  },
  {
    id: 'mock-cashier',
    name: 'Leo Brooks',
    role: 'cashier',
    title: 'Cashier',
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  cashier: 'Cashier',
};

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapabilities> = {
  admin: {
    viewOrders: true,
    viewDashboard: true,
    viewSettings: true,
    adjustActiveOrders: true,
    cancelOrders: true,
    editSettings: true,
    exportData: true,
  },
  manager: {
    viewOrders: true,
    viewDashboard: true,
    viewSettings: false,
    adjustActiveOrders: true,
    cancelOrders: true,
    editSettings: false,
    exportData: false,
  },
  cashier: {
    viewOrders: true,
    viewDashboard: false,
    viewSettings: false,
    adjustActiveOrders: false,
    cancelOrders: false,
    editSettings: false,
    exportData: false,
  },
};

export function getMockUserForRole(role: UserRole) {
  return MOCK_USERS.find((user) => user.role === role) ?? MOCK_USERS[0];
}

export function isUserRole(value: string): value is UserRole {
  return value === 'admin' || value === 'manager' || value === 'cashier';
}

export function hasRoleAccess(role: UserRole, capability: RoleCapability) {
  return ROLE_CAPABILITIES[role][capability];
}
