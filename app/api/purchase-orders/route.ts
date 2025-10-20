import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import PurchaseOrder from '@/lib/models/PurchaseOrder'
import Supplier from '@/lib/models/Supplier'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const supplierId = searchParams.get('supplierId')

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (status) {
      query.status = status
    }
    
    if (supplierId) {
      query.supplierId = supplierId
    }

    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('supplierId', 'name email phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: purchaseOrders
    })

  } catch (error) {
    console.error('Get purchase orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const { supplierId, items, notes } = body

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json({ 
        error: 'Supplier ID and items are required' 
      }, { status: 400 })
    }

    // Get supplier details
    const supplier = await Supplier.findOne({
      _id: supplierId,
      companyId: authResult.user.companyId
    })

    if (!supplier) {
      return NextResponse.json({ 
        error: 'Supplier not found' 
      }, { status: 404 })
    }

    // Generate PO number
    const poCount = await PurchaseOrder.countDocuments({ 
      companyId: authResult.user.companyId 
    })
    const poNumber = `PO-${new Date().getFullYear()}-${String(poCount + 1).padStart(4, '0')}`

    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      const itemTotal = item.quantity * item.unitCost
      return sum + itemTotal
    }, 0)

    // Create purchase order
    const purchaseOrder = new PurchaseOrder({
      companyId: authResult.user.companyId,
      poNumber,
      supplierId,
      supplierName: supplier.name,
      items: items.map((item: any) => ({
        itemId: item.itemId,
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost
      })),
      total,
      notes,
      createdBy: authResult.user.id,
      status: 'draft'
    })

    await purchaseOrder.save()

    // Populate the response
    await purchaseOrder.populate([
      { path: 'supplierId', select: 'name email phone' },
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: purchaseOrder,
      message: 'Purchase order created successfully'
    })

  } catch (error) {
    console.error('Create purchase order error:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    )
  }
}