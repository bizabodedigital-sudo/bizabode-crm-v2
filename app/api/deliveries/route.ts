import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Delivery from "@/lib/models/Delivery"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { QRService } from "@/lib/services/qr-service"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "deliveries", "read")) {
      return forbiddenResponse("You don't have permission to view deliveries")
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status") || ""

    const query: any = { companyId: authResult.user.companyId }

    if (status) {
      query.status = status
    }

    const skip = (page - 1) * limit

    const [deliveries, total] = await Promise.all([
      Delivery.find(query)
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate("invoiceId", "invoiceNumber customerName total")
        .populate("createdBy", "name email")
        .lean(),
      Delivery.countDocuments(query),
    ])

    return successResponse({
      deliveries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get deliveries error:", error)
    return errorResponse(error.message || "Failed to get deliveries", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "deliveries", "create")) {
      return forbiddenResponse("You don't have permission to create deliveries")
    }

    await connectDB()

    const body = await request.json()

    // Generate delivery number if not provided
    if (!body.deliveryNumber) {
      const count = await Delivery.countDocuments({ companyId: authResult.user.companyId })
      const year = new Date().getFullYear()
      body.deliveryNumber = `DEL-${year}-${String(count + 1).padStart(4, "0")}`
    }

    // Generate QR code
    const qrCode = QRService.generateQRCodeString("DEL")
    const qrCodeDataURL = await QRService.generateQRCodeDataURL(
      JSON.stringify({
        type: "delivery",
        deliveryNumber: body.deliveryNumber,
        code: qrCode,
      })
    )

    const delivery = await Delivery.create({
      ...body,
      companyId: authResult.user.companyId,
      createdBy: authResult.user.id,
      qrCode,
      qrCodeUrl: qrCodeDataURL,
    })

    return successResponse(delivery, "Delivery created successfully", 201)
  } catch (error: any) {
    console.error("Create delivery error:", error)
    if (error.code === 11000) {
      return errorResponse("A delivery with this number already exists", 409)
    }
    return errorResponse(error.message || "Failed to create delivery", 500)
  }
}

