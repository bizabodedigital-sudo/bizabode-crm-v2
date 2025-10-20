export interface FeatureFlag {
  name: string
  enabled: boolean
  description: string
  category: 'core' | 'advanced' | 'integration' | 'premium'
  dependencies?: string[]
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  'pdf-generation': {
    name: 'PDF Generation',
    enabled: true,
    description: 'Generate PDF documents for invoices, quotes, and payslips',
    category: 'core'
  },
  'email-notifications': {
    name: 'Email Notifications',
    enabled: true,
    description: 'Send email notifications for various system events',
    category: 'core'
  },
  'advanced-reporting': {
    name: 'Advanced Reporting',
    enabled: false,
    description: 'Advanced analytics and custom report generation',
    category: 'advanced'
  },
  'api-integrations': {
    name: 'API Integrations',
    enabled: true,
    description: 'Third-party API integrations and webhooks',
    category: 'integration'
  },
  'mobile-app': {
    name: 'Mobile App',
    enabled: false,
    description: 'Native mobile application for iOS and Android',
    category: 'premium'
  },
  'multi-currency': {
    name: 'Multi-Currency Support',
    enabled: true,
    description: 'Support for multiple currencies in transactions',
    category: 'core'
  },
  'multi-language': {
    name: 'Multi-Language Support',
    enabled: false,
    description: 'Interface and content in multiple languages',
    category: 'advanced'
  },
  'advanced-security': {
    name: 'Advanced Security',
    enabled: true,
    description: 'Two-factor authentication and advanced security features',
    category: 'core'
  },
  'workflow-automation': {
    name: 'Workflow Automation',
    enabled: false,
    description: 'Automated workflows and business process automation',
    category: 'advanced'
  },
  'ai-insights': {
    name: 'AI Insights',
    enabled: false,
    description: 'AI-powered insights and recommendations',
    category: 'premium'
  },
  'bulk-operations': {
    name: 'Bulk Operations',
    enabled: true,
    description: 'Bulk import/export and batch operations',
    category: 'core'
  },
  'audit-trail': {
    name: 'Audit Trail',
    enabled: true,
    description: 'Complete audit trail for all system activities',
    category: 'core'
  }
}

export const isFeatureEnabled = (featureName: string): boolean => {
  return FEATURE_FLAGS[featureName]?.enabled || false
}

export const getEnabledFeatures = (): string[] => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, flag]) => flag.enabled)
    .map(([name, _]) => name)
}

export const getFeaturesByCategory = (category: string): FeatureFlag[] => {
  return Object.values(FEATURE_FLAGS).filter(flag => flag.category === category)
}

export const getFeatureDependencies = (featureName: string): string[] => {
  return FEATURE_FLAGS[featureName]?.dependencies || []
}

export const canEnableFeature = (featureName: string): boolean => {
  const feature = FEATURE_FLAGS[featureName]
  if (!feature) return false
  
  // Check if all dependencies are enabled
  if (feature.dependencies) {
    return feature.dependencies.every(dep => isFeatureEnabled(dep))
  }
  
  return true
}

export const toggleFeature = (featureName: string, enabled: boolean): void => {
  if (FEATURE_FLAGS[featureName]) {
    FEATURE_FLAGS[featureName].enabled = enabled
  }
}
