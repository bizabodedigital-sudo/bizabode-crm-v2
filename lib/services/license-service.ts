import { api } from "@/lib/api-client-config"

const LICENSE_API_URL = process.env.LICENSE_API_URL || "https://api.bizabode.com/v1/license"
const LICENSE_API_KEY = process.env.LICENSE_API_KEY

export interface LicenseStatus {
  valid: boolean
  plan: "trial" | "basic" | "professional" | "enterprise"
  expiry: Date
  features: string[]
  maxUsers?: number
  maxItems?: number
}

export class LicenseService {
  /**
   * Verify license key with Bizabode API
   */
  static async verifyLicense(licenseKey: string): Promise<LicenseStatus> {
    try {
      // Use centralized API client for license verification
      const response = await api.license.getStatus()
      
      if (response.success && response.data) {
        return {
          valid: response.data.status === 'active',
          plan: response.data.plan as LicenseStatus['plan'],
          expiry: new Date(response.data.expiresOn),
          features: response.data.features,
          maxUsers: response.data.maxUsers,
          maxItems: response.data.maxItems || 10000,
        }
      }

      // Mock response for development/demo licenses
      if (licenseKey.startsWith("DEMO-") || licenseKey.startsWith("TEST-")) {
        return {
          valid: true,
          plan: "professional",
          expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          features: ["inventory", "crm", "quotes", "invoices", "deliveries", "reports"],
          maxUsers: 50,
          maxItems: 10000,
        }
      }

      throw new Error("Invalid license key")
    } catch (error) {
      console.error("License verification error:", error)
      throw new Error("License verification failed")
    }
  }

  /**
   * Activate license
   */
  static async activateLicense(licenseKey: string, companyId: string): Promise<LicenseStatus> {
    try {
      // Use centralized API client for license activation
      const response = await api.license.activate({ licenseKey })

      if (response.success && response.data) {
        return {
          valid: response.data.status === 'active',
          plan: response.data.plan as LicenseStatus['plan'],
          expiry: new Date(response.data.expiresOn),
          features: response.data.features,
          maxUsers: response.data.maxUsers,
          maxItems: response.data.maxItems || 10000,
        }
      }

      throw new Error(response.error || "License activation failed")
    } catch (error) {
      console.error("License activation error:", error)
      throw new Error("License activation failed")
    }
  }

  /**
   * Check if license is expired
   */
  static isLicenseExpired(expiryDate: Date): boolean {
    return new Date() > new Date(expiryDate)
  }

  /**
   * Get license status
   */
  static async getLicenseStatus(): Promise<LicenseStatus> {
    try {
      // Use centralized API client for license status
      const response = await api.license.getStatus()
      
      if (response.success && response.data) {
        return {
          valid: response.data.status === 'active',
          plan: response.data.plan as LicenseStatus['plan'],
          expiry: new Date(response.data.expiresOn),
          features: response.data.features,
          maxUsers: response.data.maxUsers,
          maxItems: response.data.maxItems || 10000,
        }
      }

      throw new Error(response.error || "Failed to get license status")
    } catch (error) {
      console.error("License status error:", error)
      throw new Error("Failed to get license status")
    }
  }

  /**
   * Check feature availability based on plan
   */
  static hasFeature(plan: string, feature: string): boolean {
    const planFeatures: Record<string, string[]> = {
      trial: ["inventory", "crm"],
      basic: ["inventory", "crm", "quotes"],
      professional: ["inventory", "crm", "quotes", "invoices", "deliveries", "reports"],
      enterprise: ["inventory", "crm", "quotes", "invoices", "deliveries", "reports", "api", "webhooks", "advanced-reports"],
    }

    return planFeatures[plan]?.includes(feature) || false
  }
}

