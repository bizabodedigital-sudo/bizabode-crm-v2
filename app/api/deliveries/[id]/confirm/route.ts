import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Delivery from "@/lib/models/Delivery"
import { authenticateToken } from "@/lib/middleware/auth"
import { QRService } from "@/lib/services/qr-service"
import { successResponse, errorResponse, unauthorizedResponse, notFoundResponse } from "@/lib/utils/api-response"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    await connectDB()

    const body = await request.json()
    const { qrCode, confirmedBy, signatureUrl, photoUrl } = body

    const delivery = await Delivery.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!delivery) {
      return notFoundResponse("Delivery not found")
    }

    // Verify QR code
    if (delivery.qrCode !== qrCode) {
      return errorResponse("Invalid QR code", 400)
    }

    if (delivery.status === "delivered") {
      return errorResponse("Delivery already confirmed", 400)
    }

    // Update delivery status
    delivery.status = "delivered"
    delivery.confirmedAt = new Date()
    delivery.confirmedBy = confirmedBy || "Customer"
    if (signatureUrl) delivery.signatureUrl = signatureUrl
    if (photoUrl) delivery.photoUrl = photoUrl

    await delivery.save()

    return successResponse(delivery, "Delivery confirmed successfully")
  } catch (error: any) {
    console.error("Confirm delivery error:", error)
    return errorResponse(error.message || "Failed to confirm delivery", 500)
  }
}

