export interface ModuleConfig {
  enabled: boolean
  required: boolean
  features?: Record<string, boolean>
  dependencies?: string[]
}

export interface ModuleFeatures {
  employees?: boolean
  payroll?: boolean
  leave?: boolean
  attendance?: boolean
  performance?: boolean
  leads?: boolean
  opportunities?: boolean
  quotes?: boolean
  invoices?: boolean
  payments?: boolean
  deliveries?: boolean
}

export const MODULE_CONFIG: Record<string, ModuleConfig> = {
  dashboard: { 
    enabled: true, 
    required: true,
    features: {}
  },
  inventory: { 
    enabled: true, 
    required: false,
    features: {}
  },
  procurement: { 
    enabled: true, 
    required: false,
    features: {}
  },
  hr: { 
    enabled: true, 
    required: false,
    features: {
      employees: true,
      payroll: true,
      leave: true,
      attendance: true,
      performance: true
    }
  },
  crm: { 
    enabled: true, 
    required: true,
    features: {
      leads: true,
      opportunities: true,
      quotes: true,
      invoices: true,
      payments: true,
      deliveries: true
    }
  },
  reports: { 
    enabled: true, 
    required: false,
    features: {}
  },
  afterSales: { 
    enabled: false, 
    required: false,
    features: {}
  },
  settings: { 
    enabled: true, 
    required: true,
    features: {}
  }
}

export const getEnabledModules = (): string[] => {
  return Object.entries(MODULE_CONFIG)
    .filter(([_, config]) => config.enabled)
    .map(([name, _]) => name)
}

export const getModuleFeatures = (moduleName: string): Record<string, boolean> => {
  return MODULE_CONFIG[moduleName]?.features || {}
}

export const isModuleEnabled = (moduleName: string): boolean => {
  return MODULE_CONFIG[moduleName]?.enabled || false
}

export const isFeatureEnabled = (moduleName: string, featureName: string): boolean => {
  return MODULE_CONFIG[moduleName]?.features?.[featureName] || false
}
