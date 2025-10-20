import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Supplier from "@/lib/models/Supplier"
import PurchaseOrder from "@/lib/models/PurchaseOrder"
import { authenticateToken } from "@/lib/middleware/auth"
import { rbacMiddleware } from "@/lib/middleware/rbac"
import { errorResponse, successResponse } from "@/lib/utils/api-responses"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const supplier = await Supplier.findOne({
      _id: id,
      companyId: authResult.user.companyId,
    })
      .populate("createdBy", "name")

    if (!supplier) {
      return errorResponse("Supplier not found", 404)
    }

    // Get purchase order history for this supplier
    const purchaseOrders = await PurchaseOrder.find({
      supplierId: id,
      companyId: authResult.user.companyId,
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .limit(10)

    const supplierData = {
      ...supplier.toObject(),
      purchaseOrderHistory: purchaseOrders,
      totalOrders: purchaseOrders.length,
      totalValue: purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0),
    }

    return successResponse(supplierData, "Supplier details fetched successfully")
  } catch (error: any) {
    console.error("Error fetching supplier:", error)
    return errorResponse(error.message || "Failed to fetch supplier", 500)
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    const body = await req.json()
    const { name, email, phone, address, contactPerson, taxId, paymentTerms, notes, isActive } = body

    const updatedSupplier = await Supplier.findOneAndUpdate(
      { _id: id, companyId: authResult.user.companyId },
      {
        name,
        email,
        phone,
        address,
        contactPerson,
        taxId,
        paymentTerms,
        notes,
        isActive,
        updatedBy: authResult.user._id,
      },
      { new: true }
    )

    if (!updatedSupplier) {
      return errorResponse("Supplier not found", 404)
    }

    return successResponse(updatedSupplier, "Supplier updated successfully")
  } catch (error: any) {
    console.error("Error updating supplier:", error)
    return errorResponse(error.message || "Failed to update supplier", 500)
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params
    
    // Check if supplier has any purchase orders
    const hasOrders = await PurchaseOrder.exists({ supplierId: id, companyId: authResult.user.companyId })
    if (hasOrders) {
      return errorResponse("Cannot delete supplier with existing purchase orders. Deactivate instead.", 400)
    }

    const deletedSupplier = await Supplier.findOneAndDelete({
      _id: id,
      companyId: authResult.user.companyId,
    })

    if (!deletedSupplier) {
      return errorResponse("Supplier not found", 404)
    }

    return successResponse(null, "Supplier deleted successfully", 204)
  } catch (error: any) {
    console.error("Error deleting supplier:", error)
    return errorResponse(error.message || "Failed to delete supplier", 500)
  }
}
