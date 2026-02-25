import axios from "axios"

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
      const response = await axios.post(
        `${LICENSE_API_URL}/verify`,
        { licenseKey },
        {
          headers: {
            'Authorization': `Bearer ${LICENSE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
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
      const response = await axios.post(
        `${LICENSE_API_URL}/activate`,
        { licenseKey, companyId },
        {
          headers: {
            'Authorization': `Bearer ${LICENSE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
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
  static async getLicenseStatus(licenseKey: string): Promise<LicenseStatus> {
    return await this.verifyLicense(licenseKey)
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

