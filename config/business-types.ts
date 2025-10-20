export interface BusinessTypeConfig {
  modules: string[]
  hrFeatures: string[]
  crmFeatures: string[]
  defaultCurrency: string
  dateFormat: string
  timezone: string
  compliance: string[]
}

export const BUSINESS_TYPES: Record<string, BusinessTypeConfig> = {
  'retail': {
    modules: ['dashboard', 'inventory', 'crm', 'reports'],
    hrFeatures: ['employees', 'payroll'],
    crmFeatures: ['leads', 'opportunities', 'quotes', 'invoices', 'payments'],
    defaultCurrency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timezone: 'America/New_York',
    compliance: ['basic']
  },
  'manufacturing': {
    modules: ['dashboard', 'inventory', 'procurement', 'hr', 'crm', 'reports'],
    hrFeatures: ['employees', 'payroll', 'leave', 'attendance', 'performance'],
    crmFeatures: ['leads', 'opportunities', 'quotes', 'invoices', 'payments', 'deliveries'],
    defaultCurrency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timezone: 'America/New_York',
    compliance: ['basic', 'safety']
  },
  'service': {
    modules: ['dashboard', 'hr', 'crm', 'reports'],
    hrFeatures: ['employees', 'payroll', 'leave', 'performance'],
    crmFeatures: ['leads', 'opportunities', 'quotes', 'invoices', 'payments'],
    defaultCurrency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timezone: 'America/New_York',
    compliance: ['basic']
  },
  'construction': {
    modules: ['dashboard', 'inventory', 'procurement', 'hr', 'crm', 'reports'],
    hrFeatures: ['employees', 'payroll', 'leave', 'attendance', 'performance'],
    crmFeatures: ['leads', 'opportunities', 'quotes', 'invoices', 'payments', 'deliveries'],
    defaultCurrency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timezone: 'America/New_York',
    compliance: ['basic', 'safety', 'construction']
  },
  'healthcare': {
    modules: ['dashboard', 'hr', 'crm', 'reports'],
    hrFeatures: ['employees', 'payroll', 'leave', 'attendance', 'performance'],
    crmFeatures: ['leads', 'opportunities', 'quotes', 'invoices', 'payments'],
    defaultCurrency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timezone: 'America/New_York',
    compliance: ['basic', 'healthcare', 'hipaa']
  },
  'jamaica-retail': {
    modules: ['dashboard', 'inventory', 'crm', 'reports'],
    hrFeatures: ['employees', 'payroll'],
    crmFeatures: ['leads', 'opportunities', 'quotes', 'invoices', 'payments'],
    defaultCurrency: 'JMD',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'America/Jamaica',
    compliance: ['jamaica-basic']
  },
  'jamaica-manufacturing': {
    modules: ['dashboard', 'inventory', 'procurement', 'hr', 'crm', 'reports'],
    hrFeatures: ['employees', 'payroll', 'leave', 'attendance', 'performance'],
    crmFeatures: ['leads', 'opportunities', 'quotes', 'invoices', 'payments', 'deliveries'],
    defaultCurrency: 'JMD',
    dateFormat: 'dd/MM/yyyy',
    timezone: 'America/Jamaica',
    compliance: ['jamaica-full']
  }
}

export const getBusinessTypeConfig = (businessType: string): BusinessTypeConfig => {
  return BUSINESS_TYPES[businessType] || BUSINESS_TYPES['retail']
}

export const getAvailableBusinessTypes = (): string[] => {
  return Object.keys(BUSINESS_TYPES)
}

export const getModulesForBusinessType = (businessType: string): string[] => {
  return getBusinessTypeConfig(businessType).modules
}

export const getHRFeaturesForBusinessType = (businessType: string): string[] => {
  return getBusinessTypeConfig(businessType).hrFeatures
}

export const getCRMFeaturesForBusinessType = (businessType: string): string[] => {
  return getBusinessTypeConfig(businessType).crmFeatures
}
