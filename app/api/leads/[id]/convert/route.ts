import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Lead from "@/lib/models/Lead"
import Opportunity from "@/lib/models/Opportunity"
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

    if (!checkPermission(authResult.user, "opportunities", "create")) {
      return forbiddenResponse("You don't have permission to create opportunities")
    }

    await connectDB()

    const body = await request.json()
    const { title, value, expectedCloseDate, notes } = body

    // Find the lead
    const lead = await Lead.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!lead) {
      return notFoundResponse("Lead not found")
    }

    // Create opportunity from lead
    const opportunity = await Opportunity.create({
      companyId: authResult.user.companyId,
      leadId: lead._id,
      title: title || `${lead.company} - ${lead.name}`,
      customerName: lead.name,
      customerEmail: lead.email,
      customerPhone: lead.phone,
      value: value || 0,
      stage: "prospecting",
      probability: 25,
      expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      assignedTo: lead.assignedTo,
      notes: notes || lead.notes,
    })

    // Update lead status to qualified
    lead.status = "qualified"
    await lead.save()

    return successResponse(
      {
        opportunity,
        lead,
      },
      "Lead converted to opportunity successfully",
      201
    )
  } catch (error: any) {
    console.error("Convert lead error:", error)
    return errorResponse(error.message || "Failed to convert lead", 500)
  }
}

