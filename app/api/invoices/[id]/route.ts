import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Invoice from "@/lib/models/Invoice"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "invoices", "read")) {
      return forbiddenResponse("You don't have permission to view invoices")
    }

    await connectDB()

    const invoice = await Invoice.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })
      .populate("createdBy", "name email")
      .populate("quoteId", "quoteNumber")

    if (!invoice) {
      return notFoundResponse("Invoice not found")
    }

    return successResponse(invoice)
  } catch (error: any) {
    console.error("Get invoice error:", error)
    return errorResponse(error.message || "Failed to get invoice", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "invoices", "update")) {
      return forbiddenResponse("You don't have permission to update invoices")
    }

    await connectDB()

    const body = await request.json()

    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: id,
        companyId: authResult.user.companyId,
      },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("quoteId", "quoteNumber")

    if (!invoice) {
      return notFoundResponse("Invoice not found")
    }

    return successResponse(invoice, "Invoice updated successfully")
  } catch (error: any) {
    console.error("Update invoice error:", error)
    return errorResponse(error.message || "Failed to update invoice", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "invoices", "delete")) {
      return forbiddenResponse("You don't have permission to delete invoices")
    }

    await connectDB()

    const invoice = await Invoice.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!invoice) {
      return notFoundResponse("Invoice not found")
    }

    // Can only delete draft invoices
    if (invoice.status !== "draft") {
      return errorResponse("Only draft invoices can be deleted", 400)
    }

    await Invoice.findByIdAndDelete(id)

    return successResponse(null, "Invoice deleted successfully")
  } catch (error: any) {
    console.error("Delete invoice error:", error)
    return errorResponse(error.message || "Failed to delete invoice", 500)
  }
}

