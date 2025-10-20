import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Lead from "@/lib/models/Lead"
import Opportunity from "@/lib/models/Opportunity"
import Quote from "@/lib/models/Quote"
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

    if (!checkPermission(authResult.user, "reports", "read")) {
      return forbiddenResponse("You don't have permission to view reports")
    }

    await connectDB()

    const companyId = authResult.user.companyId

    // Get counts for sales funnel
    const [totalLeads, qualifiedLeads, totalOpportunities, wonOpportunities, totalQuotes, acceptedQuotes, totalInvoices, paidInvoices] =
      await Promise.all([
        Lead.countDocuments({ companyId }),
        Lead.countDocuments({ companyId, status: "qualified" }),
        Opportunity.countDocuments({ companyId }),
        Opportunity.countDocuments({ companyId, stage: "closed-won" }),
        Quote.countDocuments({ companyId }),
        Quote.countDocuments({ companyId, status: "accepted" }),
        Invoice.countDocuments({ companyId }),
        Invoice.countDocuments({ companyId, status: "paid" }),
      ])

    const funnelData = [
      { stage: "Leads", count: totalLeads, percentage: 100 },
      {
        stage: "Qualified Leads",
        count: qualifiedLeads,
        percentage: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
      },
      {
        stage: "Opportunities",
        count: totalOpportunities,
        percentage: totalLeads > 0 ? (totalOpportunities / totalLeads) * 100 : 0,
      },
      {
        stage: "Quotes",
        count: totalQuotes,
        percentage: totalLeads > 0 ? (totalQuotes / totalLeads) * 100 : 0,
      },
      {
        stage: "Invoices",
        count: totalInvoices,
        percentage: totalLeads > 0 ? (totalInvoices / totalLeads) * 100 : 0,
      },
      {
        stage: "Paid",
        count: paidInvoices,
        percentage: totalLeads > 0 ? (paidInvoices / totalLeads) * 100 : 0,
      },
    ]

    return successResponse({
      funnel: funnelData,
      conversionRates: {
        leadToQualified: totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(2) : "0",
        leadToOpportunity: totalLeads > 0 ? ((totalOpportunities / totalLeads) * 100).toFixed(2) : "0",
        opportunityToWon: totalOpportunities > 0 ? ((wonOpportunities / totalOpportunities) * 100).toFixed(2) : "0",
        quoteToAccepted: totalQuotes > 0 ? ((acceptedQuotes / totalQuotes) * 100).toFixed(2) : "0",
        invoiceToPaid: totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(2) : "0",
      },
    })
  } catch (error: any) {
    console.error("Get sales funnel error:", error)
    return errorResponse(error.message || "Failed to get sales funnel data", 500)
  }
}

