import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import Company from "@/lib/models/Company"
import { authenticateToken } from "@/lib/middleware/auth"
import { successResponse, unauthorizedResponse, errorResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    await connectDB()

    // Get full user details
    const user = await User.findById(authResult.user.id)

    if (!user) {
      return errorResponse("User not found", 404)
    }

    // Get company details
    const company = await Company.findById(user.companyId)

    return successResponse({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      company: company
        ? {
            id: company._id,
            name: company.name,
            licensePlan: company.licensePlan,
            licenseExpiry: company.licenseExpiry,
            licenseStatus: company.licenseStatus,
            settings: company.settings,
          }
        : null,
    })
  } catch (error: any) {
    console.error("Get user error:", error)
    return errorResponse(error.message || "Failed to get user", 500)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateToken(request)

    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    await connectDB()

    const body = await request.json()
    const { name, avatar } = body

    // Update user
    const user = await User.findByIdAndUpdate(
      authResult.user.id,
      {
        ...(name && { name }),
        ...(avatar && { avatar }),
        updatedAt: new Date(),
      },
      { new: true }
    )

    if (!user) {
      return errorResponse("User not found", 404)
    }

    return successResponse(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
      "Profile updated successfully"
    )
  } catch (error: any) {
    console.error("Update profile error:", error)
    return errorResponse(error.message || "Failed to update profile", 500)
  }
}

