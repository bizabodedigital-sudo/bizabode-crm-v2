import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Lead from "@/lib/models/Lead"
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

    if (!checkPermission(authResult.user, "leads", "read")) {
      return forbiddenResponse("You don't have permission to view leads")
    }

    await connectDB()

    const lead = await Lead.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    }).populate("assignedTo", "name email")

    if (!lead) {
      return notFoundResponse("Lead not found")
    }

    return successResponse(lead)
  } catch (error: any) {
    console.error("Get lead error:", error)
    return errorResponse(error.message || "Failed to get lead", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "leads", "update")) {
      return forbiddenResponse("You don't have permission to update leads")
    }

    await connectDB()

    const body = await request.json()

    const lead = await Lead.findOneAndUpdate(
      {
        _id: id,
        companyId: authResult.user.companyId,
      },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("assignedTo", "name email")

    if (!lead) {
      return notFoundResponse("Lead not found")
    }

    return successResponse(lead, "Lead updated successfully")
  } catch (error: any) {
    console.error("Update lead error:", error)
    return errorResponse(error.message || "Failed to update lead", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "leads", "delete")) {
      return forbiddenResponse("You don't have permission to delete leads")
    }

    await connectDB()

    const lead = await Lead.findOneAndDelete({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!lead) {
      return notFoundResponse("Lead not found")
    }

    return successResponse(null, "Lead deleted successfully")
  } catch (error: any) {
    console.error("Delete lead error:", error)
    return errorResponse(error.message || "Failed to delete lead", 500)
  }
}

