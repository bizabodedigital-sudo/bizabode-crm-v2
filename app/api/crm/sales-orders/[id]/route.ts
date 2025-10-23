import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import SalesOrder from '@/lib/models/SalesOrder'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid sales order ID' }, { status: 400 })
    }

    const salesOrder = await SalesOrder.findOne({
      _id: params.id
    })
      .populate('quoteId', 'quoteNumber customerName total')
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('invoiceId', 'invoiceNumber status total')

    if (!salesOrder) {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: salesOrder
    })

  } catch (error) {
    console.error('Get sales order error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid sales order ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
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
      status,
      notes,
      assignedTo,
      driverName,
      driverPhone,
      trackingNumber,
      deliveryNotes
    } = body

    const updateData: any = {
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
      orderDate: orderDate ? new Date(orderDate) : undefined,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      deliveryAddress,
      paymentTerms,
      status,
      notes,
      assignedTo,
      driverName,
      driverPhone,
      trackingNumber,
      deliveryNotes
    }

    // Update timestamps based on status changes
    if (status === 'Processing' && !updateData.processedAt) {
      updateData.processedAt = new Date()
    }
    if (status === 'Dispatched' && !updateData.dispatchedAt) {
      updateData.dispatchedAt = new Date()
    }
    if (status === 'Delivered' && !updateData.deliveredAt) {
      updateData.deliveredAt = new Date()
    }
    if (status === 'Cancelled' && !updateData.cancelledAt) {
      updateData.cancelledAt = new Date()
    }

    const salesOrder = await SalesOrder.findOneAndUpdate(
      {
        _id: params.id
      },
      updateData,
      { new: true, runValidators: true }
    )
      .populate('quoteId', 'quoteNumber customerName total')
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .populate('invoiceId', 'invoiceNumber status total')

    if (!salesOrder) {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: salesOrder,
      message: 'Sales order updated successfully'
    })

  } catch (error) {
    console.error('Update sales order error:', error)
    return NextResponse.json(
      { error: 'Failed to update sales order' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid sales order ID' }, { status: 400 })
    }

    const salesOrder = await SalesOrder.findOneAndDelete({
      _id: params.id
    })

    if (!salesOrder) {
      return NextResponse.json({ error: 'Sales order not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Sales order deleted successfully'
    })

  } catch (error) {
    console.error('Delete sales order error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sales order' },
      { status: 500 }
    )
  }
}