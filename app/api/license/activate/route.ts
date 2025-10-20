import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Company from "@/lib/models/Company"
import { authenticateToken } from "@/lib/middleware/auth"
import { LicenseService } from "@/lib/services/license-service"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    // Only admins can activate license
    if (authResult.user.role !== "admin") {
      return forbiddenResponse("Only administrators can activate licenses")
    }

    await connectDB()

    const body = await request.json()
    const { licenseKey } = body

    if (!licenseKey) {
      return errorResponse("License key is required", 400)
    }

    // Verify license with Bizabode API
    const licenseStatus = await LicenseService.activateLicense(licenseKey, authResult.user.companyId)

    // Update company
    const company = await Company.findByIdAndUpdate(
      authResult.user.companyId,
      {
        licenseKey,
        licensePlan: licenseStatus.plan,
        licenseExpiry: licenseStatus.expiry,
        licenseStatus: "active",
      },
      { new: true }
    )

    if (!company) {
      return errorResponse("Company not found", 404)
    }

    return successResponse(
      {
        licenseKey: company.licenseKey,
        plan: company.licensePlan,
        expiry: company.licenseExpiry,
        status: company.licenseStatus,
        features: licenseStatus.features,
      },
      "License activated successfully"
    )
  } catch (error: any) {
    console.error("Activate license error:", error)
    return errorResponse(error.message || "Failed to activate license", 500)
  }
}

