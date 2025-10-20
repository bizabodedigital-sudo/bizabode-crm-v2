import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import PurchaseOrder from '@/lib/models/PurchaseOrder'
import Item from '@/lib/models/Item'
import StockMovement from '@/lib/models/StockMovement'
import mongoose from 'mongoose'

export async function POST(
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid purchase order ID' }, { status: 400 })
    }

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    // Only allow receiving sent purchase orders
    if (purchaseOrder.status !== 'sent') {
      return NextResponse.json({ 
        error: 'Only sent purchase orders can be received' 
      }, { status: 400 })
    }

    // Update inventory for each item
    const stockMovements = []
    
    for (const poItem of purchaseOrder.items) {
      // Find the item
      const item = await Item.findOne({
        _id: poItem.itemId,
        companyId: authResult.user.companyId
      })

      if (!item) {
        console.warn(`Item ${poItem.itemId} not found for PO ${purchaseOrder.poNumber}`)
        continue
      }

      // Update item quantity
      const oldQuantity = item.quantity
      item.quantity += poItem.quantity
      await item.save()

      // Create stock movement record
      const stockMovement = new StockMovement({
        companyId: authResult.user.companyId,
        itemId: item._id,
        itemSku: item.sku,
        itemName: item.name,
        type: 'purchase',
        quantity: poItem.quantity,
        previousQuantity: oldQuantity,
        newQuantity: item.quantity,
        reference: `PO-${purchaseOrder.poNumber}`,
        notes: `Received from Purchase Order ${purchaseOrder.poNumber}`,
        createdBy: authResult.user.id
      })

      await stockMovement.save()
      stockMovements.push(stockMovement)
    }

    // Update purchase order status
    purchaseOrder.status = 'received'
    purchaseOrder.receivedDate = new Date()
    await purchaseOrder.save()

    // Populate the response
    await purchaseOrder.populate([
      { path: 'supplierId', select: 'name email phone address' },
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: {
        purchaseOrder,
        stockMovements: stockMovements.length,
        message: `Purchase order received successfully. Updated ${stockMovements.length} items.`
      }
    })

  } catch (error) {
    console.error('Receive purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to receive purchase order' },
      { status: 500 }
    )
  }
}
