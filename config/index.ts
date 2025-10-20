// Main configuration export
export * from './modules'
export * from './business-types'
export * from './regional-compliance'
export { FEATURE_FLAGS, isFeatureEnabled as isFeatureFlagEnabled } from './feature-flags'

// Configuration manager
export class ConfigurationManager {
  private static instance: ConfigurationManager
  private currentBusinessType: string = 'retail'
  private currentRegion: string = 'usa'
  private customConfig: Record<string, any> = {}

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager()
    }
    return ConfigurationManager.instance
  }

  setBusinessType(businessType: string): void {
    this.currentBusinessType = businessType
  }

  setRegion(region: string): void {
    this.currentRegion = region
  }

  getCurrentBusinessType(): string {
    return this.currentBusinessType
  }

  getCurrentRegion(): string {
    return this.currentRegion
  }

  getConfiguration() {
    return {
      businessType: this.currentBusinessType,
      region: this.currentRegion,
      modules: this.getEnabledModules(),
      features: this.getEnabledFeatures(),
      compliance: this.getComplianceFields()
    }
  }

  private getEnabledModules(): string[] {
    // This would integrate with the business type config
    return ['dashboard', 'hr', 'crm', 'reports'] // Simplified for now
  }

  private getEnabledFeatures(): string[] {
    return Object.entries(FEATURE_FLAGS)
      .filter(([_, flag]: [string, any]) => flag.enabled)
      .map(([name, _]) => name)
  }

  private getComplianceFields() {
    // This would return the compliance fields for the current region
    return []
  }
}

// Environment-based configuration
export const getEnvironmentConfig = () => {
  const businessType = process.env.BUSINESS_TYPE || 'retail'
  const region = process.env.REGION || 'usa'
  const environment = process.env.NODE_ENV || 'development'

  return {
    businessType,
    region,
    environment,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production'
  }
}
