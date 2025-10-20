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
    const { email, password, name, companyName, licenseKey } = body

    // Validation
    const errors: Record<string, string[]> = {}

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = ["Valid email is required"]
    }
    if (!password || password.length < 6) {
      errors.password = ["Password must be at least 6 characters"]
    }
    if (!name) {
      errors.name = ["Name is required"]
    }
    if (!companyName) {
      errors.companyName = ["Company name is required"]
    }
    if (!licenseKey) {
      errors.licenseKey = ["License key is required"]
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors)
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return errorResponse("User with this email already exists", 409)
    }

    // Create or find company
    let company = await Company.findOne({ licenseKey })

    if (!company) {
      // Create new company
      company = await Company.create({
        name: companyName,
        licenseKey,
        licensePlan: "trial",
        licenseExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
        licenseStatus: "active",
      })
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: "admin", // First user is admin
      companyId: company._id,
      isActive: true,
    })

    // Generate JWT token
    const token = generateToken(user._id.toString())

    return successResponse(
      {
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
        },
      },
      "Registration successful",
      201
    )
  } catch (error: any) {
    console.error("Registration error:", error)
    return errorResponse(error.message || "Registration failed", 500)
  }
}

