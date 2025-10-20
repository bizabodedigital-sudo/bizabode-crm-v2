import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Item from "@/lib/models/Item"
import StockMovement from "@/lib/models/StockMovement"
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

    if (!checkPermission(authResult.user, "stock", "update")) {
      return forbiddenResponse("You don't have permission to adjust stock")
    }

    await connectDB()

    const body = await request.json()
    const { adjustment, reason, type = "adjustment", reference } = body

    if (typeof adjustment !== "number") {
      return errorResponse("Adjustment value is required", 400)
    }

    if (!reason) {
      return errorResponse("Reason is required", 400)
    }

    const item = await Item.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!item) {
      return notFoundResponse("Item not found")
    }

    const previousQuantity = item.quantity
    const newQuantity = previousQuantity + adjustment

    if (newQuantity < 0) {
      return errorResponse("Insufficient stock", 400)
    }

    // Update item quantity
    item.quantity = newQuantity
    await item.save()

    // Create stock movement record
    await StockMovement.create({
      companyId: authResult.user.companyId,
      itemId: item._id,
      type,
      quantity: Math.abs(adjustment),
      previousQuantity,
      newQuantity,
      reason,
      reference,
      userId: authResult.user.id,
    })

    return successResponse(
      {
        item,
        previousQuantity,
        newQuantity,
        adjustment,
      },
      "Stock adjusted successfully"
    )
  } catch (error: any) {
    console.error("Adjust stock error:", error)
    return errorResponse(error.message || "Failed to adjust stock", 500)
  }
}

