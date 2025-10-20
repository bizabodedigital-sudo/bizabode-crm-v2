import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Supplier from "@/lib/models/Supplier"
import { authenticateToken } from "@/lib/middleware/auth"
import { rbacMiddleware } from "@/lib/middleware/rbac"
import { errorResponse, successResponse } from "@/lib/utils/api-responses"

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateToken(req)
    if (!authResult.authenticated) {
      return errorResponse("Unauthorized", 401)
    }

    const rbacResult = await rbacMiddleware(authResult.user, "canViewPurchaseOrders")
    if (!rbacResult.hasPermission) {
      return errorResponse("Forbidden", 403)
    }

    const suppliers = await Supplier.find({ 
      companyId: authResult.user.companyId,
      isActive: true 
    })
      .populate("createdBy", "name")
      .sort({ name: 1 })

    return successResponse(suppliers, "Suppliers fetched successfully")
  } catch (error: any) {
    console.error("Error fetching suppliers:", error)
    return errorResponse(error.message || "Failed to fetch suppliers", 500)
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateToken(req)
    if (!authResult.authenticated) {
      return errorResponse("Unauthorized", 401)
    }

    const rbacResult = await rbacMiddleware(authResult.user, "canManagePurchaseOrders")
    if (!rbacResult.hasPermission) {
      return errorResponse("Forbidden", 403)
    }

    const body = await req.json()
    const { name, email, phone, address, contactPerson, taxId, paymentTerms, notes } = body

    if (!name || !email) {
      return errorResponse("Name and email are required", 400)
    }

    const newSupplier = new Supplier({
      companyId: authResult.user.companyId,
      name,
      email,
      phone,
      address,
      contactPerson,
      taxId,
      paymentTerms,
      notes,
      createdBy: authResult.user._id,
      updatedBy: authResult.user._id,
    })

    await newSupplier.save()
    return successResponse(newSupplier, "Supplier created successfully", 201)
  } catch (error: any) {
    console.error("Error creating supplier:", error)
    return errorResponse(error.message || "Failed to create supplier", 500)
  }
}
