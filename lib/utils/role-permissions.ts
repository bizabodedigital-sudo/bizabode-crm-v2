export type UserRole = 'admin' | 'manager' | 'sales' | 'warehouse' | 'viewer'

export interface NavItem {
  title: string
  href: string
  icon: any
  roles?: UserRole[]
  children?: NavItem[]
}

export const rolePermissions = {
  admin: {
    canViewDashboard: true,
    canManageInventory: true,
    canManageCRM: true,
    canViewReports: true,
    canManageUsers: true,
    canManageSettings: true,
    canManageLicense: true,
    canManageProcurement: true,
    canManageAfterSales: true,
    canManageHR: true,
  },
  manager: {
    canViewDashboard: true,
    canManageInventory: true,
    canManageCRM: true,
    canViewReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canManageLicense: false,
    canManageProcurement: true,
    canManageAfterSales: true,
    canManageHR: true,
  },
  sales: {
    canViewDashboard: true,
    canManageInventory: false,
    canManageCRM: true,
    canViewReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canManageLicense: false,
    canManageProcurement: false,
    canManageAfterSales: true,
    canManageHR: false,
  },
  warehouse: {
    canViewDashboard: true,
    canManageInventory: true,
    canManageCRM: false,
    canViewReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canManageLicense: false,
    canManageProcurement: true,
    canManageAfterSales: false,
    canManageHR: false,
  },
  viewer: {
    canViewDashboard: true,
    canManageInventory: false,
    canManageCRM: false,
    canViewReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canManageLicense: false,
    canManageProcurement: false,
    canManageAfterSales: false,
    canManageHR: false,
  },
}

export function hasPermission(role: UserRole, permission: keyof typeof rolePermissions.admin): boolean {
  return rolePermissions[role][permission]
}

export function getNavItemsForRole(role: UserRole): {
  mainNavItems: NavItem[]
  crmNavItems: NavItem[]
  otherNavItems: NavItem[]
} {
  const allMainNavItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
    { title: "Inventory", href: "/inventory", icon: "Package", roles: ['admin', 'manager', 'warehouse'] },
    { title: "Procurement", href: "/procurement", icon: "ShoppingCart", roles: ['admin', 'manager', 'warehouse'] },
    { title: "Human Resources", href: "/hr", icon: "Users", roles: ['admin', 'manager'] },
  ]

  const allCrmNavItems: NavItem[] = [
    { title: "Leads", href: "/crm/leads", icon: "Users", roles: ['admin', 'manager', 'sales'] },
    { title: "Opportunities", href: "/crm/opportunities", icon: "Target", roles: ['admin', 'manager', 'sales'] },
    { title: "Quotes", href: "/crm/quotes", icon: "FileText", roles: ['admin', 'manager', 'sales'] },
    { title: "Invoices", href: "/crm/invoices", icon: "Receipt", roles: ['admin', 'manager', 'sales'] },
    { title: "Payments", href: "/crm/payments", icon: "CreditCard", roles: ['admin', 'manager', 'sales'] },
    { title: "Deliveries", href: "/crm/deliveries", icon: "Truck", roles: ['admin', 'manager', 'sales'] },
    { title: "Reports", href: "/crm/reports", icon: "BarChart3", roles: ['admin', 'manager', 'sales', 'viewer'] },
  ]

  const allOtherNavItems: NavItem[] = [
    { title: "After-Sales", href: "/after-sales", icon: "MessageSquare", roles: ['admin', 'manager', 'sales'] },
    { title: "Settings", href: "/settings", icon: "Settings", roles: ['admin'] },
    { title: "License", href: "/license", icon: "Key", roles: ['admin'] },
  ]

  const filterItemsByRole = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.roles) return true // No role restriction
      return item.roles.includes(role)
    })
  }

  return {
    mainNavItems: filterItemsByRole(allMainNavItems),
    crmNavItems: filterItemsByRole(allCrmNavItems),
    otherNavItems: filterItemsByRole(allOtherNavItems),
  }
}
