import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Company from "@/lib/models/Company"
import User from "@/lib/models/User"
import { authenticateToken } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Authenticate user
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Authentication required")
    }

    // Get company license information
    const company = await Company.findById(authResult.user.companyId)
    if (!company) {
      return errorResponse("Company not found", 404)
    }

    // Get current user count
    const userCount = await User.countDocuments({ 
      companyId: company._id, 
      isActive: true 
    })

    // Calculate days remaining
    const daysRemaining = Math.floor(
      (company.licenseExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    // Get features based on plan
    const getFeatures = (plan: string) => {
      const baseFeatures = [
        "Unlimited Inventory Items",
        "Advanced CRM Features", 
        "Quote & Invoice Generation",
        "QR Code Delivery Tracking",
        "Analytics & Reports",
        "Email Notifications"
      ]

      if (plan === "enterprise") {
        return [
          ...baseFeatures,
          "Priority Support",
          "API Access",
          "Custom Integrations",
          "Advanced Analytics",
          "Multi-location Support"
        ]
      }

      if (plan === "professional") {
        return [
          ...baseFeatures,
          "Priority Support",
          "API Access"
        ]
      }

      return baseFeatures
    }

    const licenseData = {
      key: company.licenseKey,
      plan: company.licensePlan,
      status: company.licenseStatus,
      activatedOn: company.createdAt.toISOString().split('T')[0],
      expiresOn: company.licenseExpiry.toISOString().split('T')[0],
      maxUsers: company.licensePlan === "enterprise" ? 100 : company.licensePlan === "professional" ? 25 : 5,
      currentUsers: userCount,
      features: getFeatures(company.licensePlan),
      daysRemaining: Math.max(0, daysRemaining)
    }

    return successResponse(licenseData, "License information retrieved successfully")

  } catch (error) {
    console.error('License status error:', error)
    return errorResponse("Failed to retrieve license information", 500)
  }
}