import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import User from "@/lib/models/User"
import connectDB from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || 'temporary-build-secret'

// Only throw error in production runtime, not during build
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  throw new Error('JWT_SECRET environment variable is required')
}

export interface AuthenticatedRequest extends NextRequest {
  user?: any
  userId?: string
  companyId?: string
}

export async function authenticateToken(request: NextRequest): Promise<{
  authenticated: boolean
  user?: any
  error?: string
}> {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return { authenticated: false, error: "No token provided" }
    }

    const decoded = jwt.verify(token, JWT_SECRET || 'fallback-secret') as any

    await connectDB()
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return { authenticated: false, error: "User not found" }
    }

    if (!user.isActive) {
      return { authenticated: false, error: "Account is inactive" }
    }

    return {
      authenticated: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.companyId.toString(),
      },
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { authenticated: false, error: "Invalid token" }
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { authenticated: false, error: "Token expired" }
    }
    return { authenticated: false, error: "Authentication failed" }
  }
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  } as jwt.SignOptions)
}

