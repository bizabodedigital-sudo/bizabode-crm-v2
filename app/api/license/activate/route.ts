import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Company from "@/lib/models/Company"
import { authenticateToken } from "@/lib/middleware/auth"
import { successResponse, errorResponse, unauthorizedResponse, validationErrorResponse } from "@/lib/utils/api-response"
import { z } from "zod"

const activateLicenseSchema = z.object({
  licenseKey: z.string().min(1, "License key is required").max(100, "License key too long")
})

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    // Authenticate user
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error || "Authentication required")
    }

    // Validate request body
    const body = await request.json()
    const validationResult = activateLicenseSchema.safeParse(body)
    
    if (!validationResult.success) {
      const errors: Record<string, string[]> = {}
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.')
        if (!errors[path]) {
          errors[path] = []
        }
        errors[path].push(err.message)
      })
      return validationErrorResponse(errors)
    }

    const { licenseKey } = validationResult.data

    // Get company
    const company = await Company.findById(authResult.user.companyId)
    if (!company) {
      return errorResponse("Company not found", 404)
    }

    // Validate license key format
    if (!licenseKey.match(/^[A-Z0-9-]+$/)) {
      return errorResponse("Invalid license key format", 400)
    }

    // Check if license key is already in use by another company
    const existingCompany = await Company.findOne({ 
      licenseKey, 
      _id: { $ne: company._id } 
    })
    
    if (existingCompany) {
      return errorResponse("License key is already in use by another company", 409)
    }

    // Determine license plan based on key prefix
    let licensePlan = "basic"
    let maxUsers = 5
    let expiryDays = 30

    if (licenseKey.startsWith("ENT-")) {
      licensePlan = "enterprise"
      maxUsers = 100
      expiryDays = 365
    } else if (licenseKey.startsWith("PRO-")) {
      licensePlan = "professional"
      maxUsers = 25
      expiryDays = 365
    } else if (licenseKey.startsWith("DEMO-") || licenseKey.startsWith("TEST-")) {
      licensePlan = "professional"
      maxUsers = 10
      expiryDays = 30
    }

    // Update company license
    const licenseExpiry = new Date()
    licenseExpiry.setDate(licenseExpiry.getDate() + expiryDays)

    company.licenseKey = licenseKey
    company.licensePlan = licensePlan
    company.licenseStatus = "active"
    company.licenseExpiry = licenseExpiry
    company.updatedAt = new Date()

    await company.save()

    // Get updated user count
    const User = (await import("@/lib/models/User")).default
    const userCount = await User.countDocuments({ 
      companyId: company._id, 
      isActive: true 
    })

    // Calculate days remaining
    const daysRemaining = Math.floor(
      (licenseExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
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
      maxUsers,
      currentUsers: userCount,
      features: getFeatures(company.licensePlan),
      daysRemaining: Math.max(0, daysRemaining)
    }

    return successResponse(licenseData, "License activated successfully")

  } catch (error) {
    console.error('License activation error:', error)
    return errorResponse("Failed to activate license", 500)
  }
}