import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Activity from '@/lib/models/Activity'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 })
    }

    const activity = await Activity.findOne({
      _id: params.id
    })
      .populate('leadId', 'name company email')
      .populate('opportunityId', 'title customerName value')
      .populate('customerId', 'companyName contactPerson email')
      .populate('assignedTo', 'name email')
      .populate('relatedQuoteId', 'quoteNumber customerName total')
      .populate('relatedOrderId', 'orderNumber customerName total')
      .populate('relatedInvoiceId', 'invoiceNumber customerName total')

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: activity
    })

  } catch (error) {
    console.error('Get activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
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
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
      type,
      subject,
      description,
      duration,
      outcome,
      scheduledDate,
      completedDate,
      assignedTo,
      status,
      priority,
      location,
      attachments,
      nextFollowUpDate
    } = body

    const activity = await Activity.findOneAndUpdate(
      {
        _id: params.id
      },
      {
        type,
        subject,
        description,
        duration,
        outcome,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        completedDate: completedDate ? new Date(completedDate) : undefined,
        assignedTo,
        status,
        priority,
        location,
        attachments: attachments || [],
        nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined
      },
      { new: true, runValidators: true }
    )
      .populate('leadId', 'name company email')
      .populate('opportunityId', 'title customerName value')
      .populate('customerId', 'companyName contactPerson email')
      .populate('assignedTo', 'name email')
      .populate('relatedQuoteId', 'quoteNumber customerName total')
      .populate('relatedOrderId', 'orderNumber customerName total')
      .populate('relatedInvoiceId', 'invoiceNumber customerName total')

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity updated successfully'
    })

  } catch (error) {
    console.error('Update activity error:', error)
    return NextResponse.json(
      { error: 'Failed to update activity' },
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
      return NextResponse.json({ error: 'Invalid activity ID' }, { status: 400 })
    }

    const activity = await Activity.findOneAndDelete({
      _id: params.id
    })

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully'
    })

  } catch (error) {
    console.error('Delete activity error:', error)
    return NextResponse.json(
      { error: 'Failed to delete activity' },
      { status: 500 }
    )
  }
}