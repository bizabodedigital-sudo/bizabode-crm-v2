import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import Company from "@/lib/models/Company"
import { generateToken } from "@/lib/middleware/auth"
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/utils/api-response"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email, password } = body

    // Validation
    const errors: Record<string, string[]> = {}

    if (!email) {
      errors.email = ["Email is required"]
    }
    if (!password) {
      errors.password = ["Password is required"]
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors)
    }

    // Find user and include password field
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")

    if (!user) {
      return errorResponse("Invalid email or password", 401)
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse("Account is inactive. Please contact your administrator.", 403)
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401)
    }

    // Get company details
    const company = await Company.findById(user.companyId)

    if (!company) {
      return errorResponse("Company not found", 404)
    }

    // Check license status
    if (company.licenseStatus !== "active") {
      return errorResponse("Company license is not active. Please contact support.", 403)
    }

    if (new Date() > company.licenseExpiry) {
      // Update license status to expired
      company.licenseStatus = "expired"
      await company.save()
      return errorResponse("Company license has expired. Please renew your license.", 403)
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = generateToken(user._id.toString())

    return successResponse({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
      },
      company: {
        id: company._id,
        name: company.name,
        licensePlan: company.licensePlan,
        licenseExpiry: company.licenseExpiry,
        licenseStatus: company.licenseStatus,
      },
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return errorResponse(error.message || "Login failed", 500)
  }
}

