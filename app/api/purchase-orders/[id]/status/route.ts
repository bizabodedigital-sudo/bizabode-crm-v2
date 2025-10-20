import { NextRequest, NextResponse } from 'next/server'
import { PurchaseOrder } from '@/lib/models/PurchaseOrder'
import { Item } from '@/lib/models/Item'
import { StockMovement } from '@/lib/models/StockMovement'
import { connectDB } from '@/lib/db'
import { authenticateToken } from '@/lib/middleware/auth'
import { authorizeRole } from '@/lib/middleware/rbac'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })

    if (!purchaseOrder) {
      return NextResponse.json(
        { error: 'Purchase order not found' },
        { status: 404 }
      )
    }

    // Check permissions based on status change
    if (status === 'approved') {
      const roleResult = await authorizeRole(authResult.user, ['admin', 'manager'])
      if (!roleResult.success) {
        return NextResponse.json({ error: 'Insufficient permissions to approve' }, { status: 403 })
      }
      purchaseOrder.approvedBy = authResult.user.id
      purchaseOrder.approvedAt = new Date()
    }

    if (status === 'received') {
      const roleResult = await authorizeRole(authResult.user, ['admin', 'manager', 'warehouse'])
      if (!roleResult.success) {
        return NextResponse.json({ error: 'Insufficient permissions to receive' }, { status: 403 })
      }
      
      // Update stock for each item
      for (const poItem of purchaseOrder.items) {
        const item = await Item.findById(poItem.itemId)
        if (item) {
          // Update item quantity
          item.quantity += poItem.quantity
          await item.save()

          // Create stock movement record
          const stockMovement = new StockMovement({
            itemId: poItem.itemId,
            companyId: authResult.user.companyId,
            type: 'IN',
            quantity: poItem.quantity,
            reason: 'Purchase Order Received',
            reference: purchaseOrder.poNumber,
            notes: `Received from PO ${purchaseOrder.poNumber}`,
            createdBy: authResult.user.id
          })
          await stockMovement.save()
        }
      }
      
      purchaseOrder.receivedDate = new Date()
    }

    purchaseOrder.status = status
    if (notes) {
      purchaseOrder.notes = notes
    }

    await purchaseOrder.save()

    // Populate the response
    await purchaseOrder.populate([
      { path: 'supplierId', select: 'name email phone' },
      { path: 'createdBy', select: 'name email' },
      { path: 'approvedBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: purchaseOrder,
      message: `Purchase order ${status} successfully`
    })
  } catch (error) {
    console.error('Update PO status error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase order status' },
      { status: 500 }
    )
  }
}
