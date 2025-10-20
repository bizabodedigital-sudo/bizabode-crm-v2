import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Company from "@/lib/models/Company"
import { authenticateToken } from "@/lib/middleware/auth"
import { LicenseService } from "@/lib/services/license-service"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    await connectDB()

    const company = await Company.findById(authResult.user.companyId)

    if (!company) {
      return errorResponse("Company not found", 404)
    }

    const isExpired = LicenseService.isLicenseExpired(company.licenseExpiry)
    const daysUntilExpiry = Math.ceil((company.licenseExpiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    return successResponse({
      licenseKey: company.licenseKey,
      plan: company.licensePlan,
      status: company.licenseStatus,
      expiry: company.licenseExpiry,
      isExpired,
      daysUntilExpiry,
      features: {
        inventory: LicenseService.hasFeature(company.licensePlan, "inventory"),
        crm: LicenseService.hasFeature(company.licensePlan, "crm"),
        quotes: LicenseService.hasFeature(company.licensePlan, "quotes"),
        invoices: LicenseService.hasFeature(company.licensePlan, "invoices"),
        deliveries: LicenseService.hasFeature(company.licensePlan, "deliveries"),
        reports: LicenseService.hasFeature(company.licensePlan, "reports"),
      },
    })
  } catch (error: any) {
    console.error("Get license status error:", error)
    return errorResponse(error.message || "Failed to get license status", 500)
  }
}

