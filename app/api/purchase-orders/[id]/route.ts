import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import PurchaseOrder from '@/lib/models/PurchaseOrder'
import mongoose from 'mongoose'

export async function GET(
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid purchase order ID' }, { status: 400 })
    }

    const purchaseOrder = await PurchaseOrder.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })
      .populate('supplierId', 'name email phone address')
      .populate('createdBy', 'name email')
      .populate('items.itemId', 'sku name description')

    if (!purchaseOrder) {
      return NextResponse.json({ error: 'Purchase order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: purchaseOrder
    })

  } catch (error) {
    console.error('Get purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase order' },
      { status: 500 }
    )
  }
}

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

    // Only allow updates to draft purchase orders
    if (purchaseOrder.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Only draft purchase orders can be updated' 
      }, { status: 400 })
    }

    // Update fields
    if (body.items) {
      purchaseOrder.items = body.items.map((item: any) => ({
        itemId: item.itemId,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
      }))
      
      // Recalculate total
      purchaseOrder.total = purchaseOrder.items.reduce(
        (sum: number, item: { totalCost: number }) => sum + (item.totalCost || 0),
        0
      )
    }

    if (body.notes !== undefined) {
      purchaseOrder.notes = body.notes
    }

    if (body.status) {
      purchaseOrder.status = body.status
      
      if (body.status === 'sent') {
        purchaseOrder.sentDate = new Date()
      }
    }

    await purchaseOrder.save()

    // Populate the response
    await purchaseOrder.populate([
      { path: 'supplierId', select: 'name email phone address' },
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: purchaseOrder,
      message: 'Purchase order updated successfully'
    })

  } catch (error) {
    console.error('Update purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Only allow deletion of draft purchase orders
    if (purchaseOrder.status !== 'draft') {
      return NextResponse.json({ 
        error: 'Only draft purchase orders can be deleted' 
      }, { status: 400 })
    }

    await PurchaseOrder.deleteOne({ _id: id })

    return NextResponse.json({
      success: true,
      message: 'Purchase order deleted successfully'
    })

  } catch (error) {
    console.error('Delete purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase order' },
      { status: 500 }
    )
  }
}