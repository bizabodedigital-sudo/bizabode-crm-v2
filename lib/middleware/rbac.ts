// Role-Based Access Control (RBAC) middleware

export type UserRole = "admin" | "manager" | "sales" | "warehouse" | "viewer"

interface Permission {
  resource: string
  action: "create" | "read" | "update" | "delete"
}

// Define role permissions
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    // Admin has all permissions
    { resource: "*", action: "create" },
    { resource: "*", action: "read" },
    { resource: "*", action: "update" },
    { resource: "*", action: "delete" },
  ],
  manager: [
    { resource: "leads", action: "create" },
    { resource: "leads", action: "read" },
    { resource: "leads", action: "update" },
    { resource: "leads", action: "delete" },
    { resource: "opportunities", action: "create" },
    { resource: "opportunities", action: "read" },
    { resource: "opportunities", action: "update" },
    { resource: "opportunities", action: "delete" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "read" },
    { resource: "quotes", action: "update" },
    { resource: "quotes", action: "delete" },
    { resource: "invoices", action: "create" },
    { resource: "invoices", action: "read" },
    { resource: "invoices", action: "update" },
    { resource: "invoices", action: "delete" },
    { resource: "items", action: "read" },
    { resource: "items", action: "update" },
    { resource: "payments", action: "create" },
    { resource: "payments", action: "read" },
    { resource: "deliveries", action: "create" },
    { resource: "deliveries", action: "read" },
    { resource: "deliveries", action: "update" },
    { resource: "reports", action: "read" },
  ],
  sales: [
    { resource: "leads", action: "create" },
    { resource: "leads", action: "read" },
    { resource: "leads", action: "update" },
    { resource: "opportunities", action: "create" },
    { resource: "opportunities", action: "read" },
    { resource: "opportunities", action: "update" },
    { resource: "quotes", action: "create" },
    { resource: "quotes", action: "read" },
    { resource: "quotes", action: "update" },
    { resource: "invoices", action: "read" },
    { resource: "items", action: "read" },
    { resource: "deliveries", action: "read" },
  ],
  warehouse: [
    { resource: "items", action: "create" },
    { resource: "items", action: "read" },
    { resource: "items", action: "update" },
    { resource: "stock", action: "create" },
    { resource: "stock", action: "read" },
    { resource: "stock", action: "update" },
    { resource: "deliveries", action: "create" },
    { resource: "deliveries", action: "read" },
    { resource: "deliveries", action: "update" },
  ],
  viewer: [
    { resource: "leads", action: "read" },
    { resource: "opportunities", action: "read" },
    { resource: "quotes", action: "read" },
    { resource: "invoices", action: "read" },
    { resource: "items", action: "read" },
    { resource: "deliveries", action: "read" },
  ],
}

export function hasPermission(role: UserRole, resource: string, action: Permission["action"]): boolean {
  const permissions = rolePermissions[role] || []

  // Check for wildcard permission (admin)
  const hasWildcard = permissions.some((p) => p.resource === "*" && p.action === action)
  if (hasWildcard) return true

  // Check for specific permission
  return permissions.some((p) => p.resource === resource && p.action === action)
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (userRole: UserRole): boolean => {
    return allowedRoles.includes(userRole)
  }
}

export function checkPermission(user: { role: UserRole }, resource: string, action: Permission["action"]): boolean {
  // Admin users have all permissions
  if (user.role === 'admin') {
    return true
  }
  return hasPermission(user.role, resource, action)
}

// Export the middleware function
export function rbacMiddleware(allowedRoles: UserRole[]) {
  return (user: { role: UserRole }): boolean => {
    return allowedRoles.includes(user.role)
  }
}

// Alias for authorizeRole
export function authorizeRole(...allowedRoles: UserRole[]) {
  return (user: { role: UserRole }): boolean => {
    return allowedRoles.includes(user.role)
  }
}

