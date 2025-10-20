import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Item from "@/lib/models/Item"
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

    if (!checkPermission(authResult.user, "items", "read")) {
      return forbiddenResponse("You don't have permission to view items")
    }

    await connectDB()

    const item = await Item.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!item) {
      return notFoundResponse("Item not found")
    }

    return successResponse(item)
  } catch (error: any) {
    console.error("Get item error:", error)
    return errorResponse(error.message || "Failed to get item", 500)
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "items", "update")) {
      return forbiddenResponse("You don't have permission to update items")
    }

    await connectDB()

    const body = await request.json()

    const item = await Item.findOneAndUpdate(
      {
        _id: id,
        companyId: authResult.user.companyId,
      },
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )

    if (!item) {
      return notFoundResponse("Item not found")
    }

    return successResponse(item, "Item updated successfully")
  } catch (error: any) {
    console.error("Update item error:", error)
    return errorResponse(error.message || "Failed to update item", 500)
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "items", "delete")) {
      return forbiddenResponse("You don't have permission to delete items")
    }

    await connectDB()

    // Soft delete by setting isActive to false
    const item = await Item.findOneAndUpdate(
      {
        _id: id,
        companyId: authResult.user.companyId,
      },
      { isActive: false, updatedAt: new Date() },
      { new: true }
    )

    if (!item) {
      return notFoundResponse("Item not found")
    }

    return successResponse(null, "Item deleted successfully")
  } catch (error: any) {
    console.error("Delete item error:", error)
    return errorResponse(error.message || "Failed to delete item", 500)
  }
}

