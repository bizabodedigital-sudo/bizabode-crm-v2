import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Invoice from "@/lib/models/Invoice"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "invoices", "read")) {
      return forbiddenResponse("You don't have permission to view invoices")
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

    // Check for overdue invoices
    const now = new Date()
    const invoices = await Invoice.find({
      companyId: authResult.user.companyId,
      status: "sent",
      dueDate: { $lt: now },
    })

    // Update overdue invoices
    for (const invoice of invoices) {
      invoice.status = "overdue"
      await invoice.save()
    }

    const skip = (page - 1) * limit

    const [result, total] = await Promise.all([
      Invoice.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("quoteId", "quoteNumber")
        .lean(),
      Invoice.countDocuments(query),
    ])

    return successResponse({
      invoices: result,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get invoices error:", error)
    return errorResponse(error.message || "Failed to get invoices", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "invoices", "create")) {
      return forbiddenResponse("You don't have permission to create invoices")
    }

    await connectDB()

    const body = await request.json()

    // Generate invoice number if not provided
    if (!body.invoiceNumber) {
      const count = await Invoice.countDocuments({ companyId: authResult.user.companyId })
      const year = new Date().getFullYear()
      body.invoiceNumber = `INV-${year}-${String(count + 1).padStart(4, "0")}`
    }

    const invoice = await Invoice.create({
      ...body,
      companyId: authResult.user.companyId,
      createdBy: authResult.user.id,
    })

    return successResponse(invoice, "Invoice created successfully", 201)
  } catch (error: any) {
    console.error("Create invoice error:", error)
    if (error.code === 11000) {
      return errorResponse("An invoice with this number already exists", 409)
    }
    return errorResponse(error.message || "Failed to create invoice", 500)
  }
}

