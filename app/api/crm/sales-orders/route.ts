import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SalesOrder from '@/lib/models/SalesOrder'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (customerId) query.customerId = customerId
    if (status) query.status = status
    if (assignedTo) query.assignedTo = assignedTo

    // Get sales orders with pagination
    const salesOrders = await SalesOrder.find(query)
      .populate('quoteId', 'quoteNumber customerName total')
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('invoiceId', 'invoiceNumber status total')
      .sort({ orderDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await SalesOrder.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: salesOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get sales orders error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'system'
    
    const body = await request.json()
    const {
      companyId,
      quoteId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      subtotal,
      tax,
      taxRate,
      discount,
      total,
      orderDate,
      deliveryDate,
      deliveryAddress,
      paymentTerms,
      notes,
      assignedTo
    } = body

    // Validate required fields
    if (!companyId || !customerName || !customerEmail || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, customerName, customerEmail, items' 
      }, { status: 400 })
    }

    // Generate order number
    const orderCount = await SalesOrder.countDocuments({ companyId })
    const orderNumber = `SO-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

    // Create sales order
    const salesOrder = new SalesOrder({
      companyId,
      orderNumber,
      quoteId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      items,
      subtotal: subtotal || 0,
      tax: tax || 0,
      taxRate: taxRate || 10,
      discount: discount || 0,
      total: total || 0,
      orderDate: orderDate ? new Date(orderDate) : new Date(),
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      deliveryAddress,
      paymentTerms: paymentTerms || 'Net 30',
      notes,
      createdBy: userId,
      assignedTo,
      status: 'Pending'
    })

    await salesOrder.save()

    // Populate the response
    await salesOrder.populate([
      { path: 'quoteId', select: 'quoteNumber customerName total' },
      { path: 'customerId', select: 'companyName contactPerson email phone' },
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'invoiceId', select: 'invoiceNumber status total' }
    ])

    return NextResponse.json({
      success: true,
      data: salesOrder,
      message: 'Sales order created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create sales order error:', error)
    return NextResponse.json(
      { error: 'Failed to create sales order' },
      { status: 500 }
    )
  }
}