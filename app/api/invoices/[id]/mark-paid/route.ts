import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Invoice from "@/lib/models/Invoice"
import Payment from "@/lib/models/Payment"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/lib/utils/api-response"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { amount, method = "other", reference = "" } = body

    const invoice = await Invoice.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!invoice) {
      return notFoundResponse("Invoice not found")
    }

    const paymentAmount = amount || invoice.total - invoice.paidAmount

    // Create payment record
    await Payment.create({
      companyId: authResult.user.companyId,
      invoiceId: invoice._id,
      amount: paymentAmount,
      method,
      reference,
      processedBy: authResult.user.id,
      notes: body.notes || "",
    })

    // Update invoice
    invoice.paidAmount += paymentAmount

    if (invoice.paidAmount >= invoice.total) {
      invoice.status = "paid"
      invoice.paidDate = new Date()
    } else if (invoice.paidAmount > 0) {
      invoice.status = "partial"
    }

    await invoice.save()

    return successResponse(invoice, "Invoice payment recorded successfully")
  } catch (error: any) {
    console.error("Mark invoice paid error:", error)
    return errorResponse(error.message || "Failed to record payment", 500)
  }
}

