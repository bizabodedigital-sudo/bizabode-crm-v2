import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/utils/api-response"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { token, password } = body

    // Validation
    const errors: Record<string, string[]> = {}

    if (!token) {
      errors.token = ["Reset token is required"]
    }
    if (!password || password.length < 6) {
      errors.password = ["Password must be at least 6 characters"]
    }

    if (Object.keys(errors).length > 0) {
      return validationErrorResponse(errors)
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    })

    if (!user) {
      return errorResponse("Invalid or expired reset token", 400)
    }

    // Update password
    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save()

    return successResponse(null, "Password has been reset successfully")
  } catch (error: any) {
    console.error("Reset password error:", error)
    return errorResponse(error.message || "Failed to reset password", 500)
  }
}

