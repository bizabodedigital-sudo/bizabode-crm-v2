import { NextRequest, NextResponse } from "next/server"
import { connect } from "@/lib/db"
import Quote from "@/lib/models/Quote"
import Company from "@/lib/models/Company"
import { authenticateToken } from "@/lib/middleware/auth"
import { rbacMiddleware } from "@/lib/middleware/rbac"
import { PDFService } from "@/lib/services/pdf-service"
import { errorResponse, successResponse } from "@/lib/utils/api-responses"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await connect()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return errorResponse("Unauthorized", 401)
    }

    // Check if user has CRM permissions
    if (!['admin', 'manager'].includes(authResult.user.role)) {
      return errorResponse("Forbidden", 403)
    }

    const quote = await Quote.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!quote) {
      return errorResponse("Quote not found", 404)
    }

    const company = await Company.findById(authResult.user.companyId)

    if (!company) {
      return errorResponse("Company not found", 404)
    }

    // Generate PDF
    const pdfBuffer = await PDFService.generateQuotePDF(quote, company)

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Quote-${quote.quoteNumber}.pdf"`,
      },
    })
  } catch (error: any) {
    console.error("Generate quote PDF error:", error)
    return errorResponse(error.message || "Failed to generate PDF", 500)
  }
}

