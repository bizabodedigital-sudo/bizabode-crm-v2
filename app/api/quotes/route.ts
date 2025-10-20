import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Quote from "@/lib/models/Quote"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "quotes", "read")) {
      return forbiddenResponse("You don't have permission to view quotes")
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status") || ""

    const query: any = { companyId: authResult.user.companyId }

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [quotes, total] = await Promise.all([
      Quote.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("opportunityId", "title")
        .lean(),
      Quote.countDocuments(query),
    ])

    return successResponse({
      quotes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get quotes error:", error)
    return errorResponse(error.message || "Failed to get quotes", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "quotes", "create")) {
      return forbiddenResponse("You don't have permission to create quotes")
    }

    await connectDB()

    const body = await request.json()

    // Generate quote number if not provided
    if (!body.quoteNumber) {
      const count = await Quote.countDocuments({ companyId: authResult.user.companyId })
      const year = new Date().getFullYear()
      body.quoteNumber = `QT-${year}-${String(count + 1).padStart(4, "0")}`
    }

    const quote = await Quote.create({
      ...body,
      companyId: authResult.user.companyId,
      createdBy: authResult.user.id,
    })

    return successResponse(quote, "Quote created successfully", 201)
  } catch (error: any) {
    console.error("Create quote error:", error)
    if (error.code === 11000) {
      return errorResponse("A quote with this number already exists", 409)
    }
    return errorResponse(error.message || "Failed to create quote", 500)
  }
}

