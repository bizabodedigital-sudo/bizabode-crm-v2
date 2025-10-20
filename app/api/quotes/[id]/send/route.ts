import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Quote from "@/lib/models/Quote"
import Company from "@/lib/models/Company"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { PDFService } from "@/lib/services/pdf-service"
import { EmailService } from "@/lib/services/email-service"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse, notFoundResponse } from "@/lib/utils/api-response"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "quotes", "update")) {
      return forbiddenResponse("You don't have permission to send quotes")
    }

    await connectDB()

    const quote = await Quote.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!quote) {
      return notFoundResponse("Quote not found")
    }

    const company = await Company.findById(authResult.user.companyId)

    if (!company) {
      return notFoundResponse("Company not found")
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generateQuotePDF(quote, company)

    // Send email
    await EmailService.sendQuoteEmail(quote.customerEmail, quote.quoteNumber, pdfBuffer, quote.customerName, company.name)

    // Update quote status
    quote.status = "sent"
    quote.sentAt = new Date()
    await quote.save()

    return successResponse(quote, "Quote sent successfully")
  } catch (error: any) {
    console.error("Send quote error:", error)
    return errorResponse(error.message || "Failed to send quote", 500)
  }
}

