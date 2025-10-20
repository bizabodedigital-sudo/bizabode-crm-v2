import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import User from "@/lib/models/User"
import { EmailService } from "@/lib/services/email-service"
import { successResponse, errorResponse } from "@/lib/utils/api-response"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { email } = body

    if (!email) {
      return errorResponse("Email is required", 400)
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(null, "If an account exists with this email, a password reset link has been sent.")
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex")
    user.resetPasswordToken = resetToken
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    await user.save()

    // Send email
    try {
      await EmailService.sendPasswordResetEmail(user.email, resetToken, user.name)
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError)
      // Don't expose email sending errors to user
    }

    return successResponse(null, "If an account exists with this email, a password reset link has been sent.")
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return errorResponse(error.message || "Failed to process request", 500)
  }
}

