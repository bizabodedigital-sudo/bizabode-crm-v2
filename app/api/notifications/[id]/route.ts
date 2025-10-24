import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const notification = await Notification.findOne({
      _id: params.id,
      userId: session.user.id
    })
      .populate('relatedTaskId', 'title status')
      .populate('relatedActivityId', 'subject type')
      .populate('relatedLeadId', 'name company')
      .populate('relatedOpportunityId', 'title stage')
      .populate('relatedCustomerId', 'companyName contactPerson')
      .populate('relatedOrderId', 'orderNumber status')
      .populate('relatedInvoiceId', 'invoiceNumber status')
      .populate('relatedQuoteId', 'quoteNumber status')
    
    if (!notification) {
      return NextResponse.json({ 
        error: 'Notification not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: notification
    })
    
  } catch (error) {
    console.error('Get notification error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch notification' 
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { isRead, data } = body
    
    const updateData: any = {}
    
    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead
      if (isRead) {
        updateData.readAt = new Date()
      } else {
        updateData.readAt = null
      }
    }
    
    if (data) {
      updateData.data = data
    }
    
    const notification = await Notification.findOneAndUpdate(
      {
        _id: params.id,
        userId: session.user.id
      },
      updateData,
      { new: true }
    )
      .populate('relatedTaskId', 'title status')
      .populate('relatedActivityId', 'subject type')
      .populate('relatedLeadId', 'name company')
      .populate('relatedOpportunityId', 'title stage')
      .populate('relatedCustomerId', 'companyName contactPerson')
      .populate('relatedOrderId', 'orderNumber status')
      .populate('relatedInvoiceId', 'invoiceNumber status')
      .populate('relatedQuoteId', 'quoteNumber status')
    
    if (!notification) {
      return NextResponse.json({ 
        error: 'Notification not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: notification
    })
    
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update notification' 
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const notification = await Notification.findOneAndDelete({
      _id: params.id,
      userId: session.user.id
    })
    
    if (!notification) {
      return NextResponse.json({ 
        error: 'Notification not found' 
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete notification' 
    }, { status: 500 })
  }
}
