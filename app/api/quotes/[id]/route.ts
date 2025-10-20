import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Quote from "@/lib/models/Quote"
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

    if (!checkPermission(authResult.user, "quotes", "read")) {
      return forbiddenResponse("You don't have permission to view quotes")
    }

    await connectDB()

    const quote = await Quote.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })
      .populate("createdBy", "name email")
      .populate("opportunityId", "title customerName")

    if (!quote) {
      return notFoundResponse("Quote not found")
    }

    return successResponse(quote)
  } catch (error: any) {
    console.error("Get quote error:", error)
    return errorResponse(error.message || "Failed to get quote", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "quotes", "update")) {
      return forbiddenResponse("You don't have permission to update quotes")
    }

    await connectDB()

    const body = await request.json()

    const quote = await Quote.findOneAndUpdate(
      {
        _id: id,
        companyId: authResult.user.companyId,
      },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("opportunityId", "title")

    if (!quote) {
      return notFoundResponse("Quote not found")
    }

    return successResponse(quote, "Quote updated successfully")
  } catch (error: any) {
    console.error("Update quote error:", error)
    return errorResponse(error.message || "Failed to update quote", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "quotes", "delete")) {
      return forbiddenResponse("You don't have permission to delete quotes")
    }

    await connectDB()

    const quote = await Quote.findOneAndDelete({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!quote) {
      return notFoundResponse("Quote not found")
    }

    return successResponse(null, "Quote deleted successfully")
  } catch (error: any) {
    console.error("Delete quote error:", error)
    return errorResponse(error.message || "Failed to delete quote", 500)
  }
}

