import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Opportunity from "@/lib/models/Opportunity"
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

    if (!checkPermission(authResult.user, "opportunities", "read")) {
      return forbiddenResponse("You don't have permission to view opportunities")
    }

    await connectDB()

    const opportunity = await Opportunity.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })
      .populate("assignedTo", "name email")
      .populate("leadId", "name email company")

    if (!opportunity) {
      return notFoundResponse("Opportunity not found")
    }

    return successResponse(opportunity)
  } catch (error: any) {
    console.error("Get opportunity error:", error)
    return errorResponse(error.message || "Failed to get opportunity", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "opportunities", "update")) {
      return forbiddenResponse("You don't have permission to update opportunities")
    }

    await connectDB()

    const body = await request.json()

    // If stage is being updated to closed-won or closed-lost, set actualCloseDate
    if (body.stage === "closed-won" || body.stage === "closed-lost") {
      body.actualCloseDate = new Date()
    }

    const opportunity = await Opportunity.findOneAndUpdate(
      {
        _id: id,
        companyId: authResult.user.companyId,
      },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email")
      .populate("leadId", "name email company")

    if (!opportunity) {
      return notFoundResponse("Opportunity not found")
    }

    return successResponse(opportunity, "Opportunity updated successfully")
  } catch (error: any) {
    console.error("Update opportunity error:", error)
    return errorResponse(error.message || "Failed to update opportunity", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "opportunities", "delete")) {
      return forbiddenResponse("You don't have permission to delete opportunities")
    }

    await connectDB()

    const opportunity = await Opportunity.findOneAndDelete({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!opportunity) {
      return notFoundResponse("Opportunity not found")
    }

    return successResponse(null, "Opportunity deleted successfully")
  } catch (error: any) {
    console.error("Delete opportunity error:", error)
    return errorResponse(error.message || "Failed to delete opportunity", 500)
  }
}

