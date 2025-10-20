import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Item from "@/lib/models/Item"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "items", "read")) {
      return forbiddenResponse("You don't have permission to view items")
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const category = searchParams.get("category") || ""
    const lowStock = searchParams.get("lowStock") === "true"

    const query: any = { companyId: authResult.user.companyId, isActive: true }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { sku: { $regex: search, $options: "i" } }]
    }

    if (category) {
      query.category = category
    }

    if (lowStock) {
      query.$expr = { $lte: ["$quantity", "$reorderLevel"] }
    }

    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
      Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Item.countDocuments(query),
    ])

    return successResponse({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get items error:", error)
    return errorResponse(error.message || "Failed to get items", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "items", "create")) {
      return forbiddenResponse("You don't have permission to create items")
    }

    await connectDB()

    const body = await request.json()

    const item = await Item.create({
      ...body,
      companyId: authResult.user.companyId,
    })

    return successResponse(item, "Item created successfully", 201)
  } catch (error: any) {
    console.error("Create item error:", error)
    if (error.code === 11000) {
      return errorResponse("An item with this SKU already exists", 409)
    }
    return errorResponse(error.message || "Failed to create item", 500)
  }
}

