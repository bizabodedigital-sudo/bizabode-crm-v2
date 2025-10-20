import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Payment from "@/lib/models/Payment"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "payments", "read")) {
      return forbiddenResponse("You don't have permission to view payments")
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const invoiceId = searchParams.get("invoiceId") || ""

    const query: any = { companyId: authResult.user.companyId }

    if (invoiceId) {
      query.invoiceId = invoiceId
    }

    const skip = (page - 1) * limit

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("invoiceId", "invoiceNumber customerName total")
        .populate("processedBy", "name email")
        .lean(),
      Payment.countDocuments(query),
    ])

    return successResponse({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get payments error:", error)
    return errorResponse(error.message || "Failed to get payments", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "payments", "create")) {
      return forbiddenResponse("You don't have permission to create payments")
    }

    await connectDB()

    const body = await request.json()

    const payment = await Payment.create({
      ...body,
      companyId: authResult.user.companyId,
      processedBy: authResult.user.id,
    })

    return successResponse(payment, "Payment recorded successfully", 201)
  } catch (error: any) {
    console.error("Create payment error:", error)
    return errorResponse(error.message || "Failed to record payment", 500)
  }
}

