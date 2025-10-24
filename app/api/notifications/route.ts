import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Notification from '@/lib/models/Notification'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    
    // Build query
    const query: any = { 
      userId: session.user.id,
      companyId: session.user.companyId
    }
    
    if (unreadOnly) {
      query.isRead = false
    }
    
    if (type) {
      query.type = type
    }
    
    if (priority) {
      query.priority = priority
    }
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate('relatedTaskId', 'title status')
      .populate('relatedActivityId', 'subject type')
      .populate('relatedLeadId', 'name company')
      .populate('relatedOpportunityId', 'title stage')
      .populate('relatedCustomerId', 'companyName contactPerson')
      .populate('relatedOrderId', 'orderNumber status')
      .populate('relatedInvoiceId', 'invoiceNumber status')
      .populate('relatedQuoteId', 'quoteNumber status')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
    
    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({ 
      ...query, 
      isRead: false 
    })
    
    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    })
    
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch notifications' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const {
      title,
      message,
      type,
      priority = 'Medium',
      data,
      relatedTaskId,
      relatedActivityId,
      relatedLeadId,
      relatedOpportunityId,
      relatedCustomerId,
      relatedOrderId,
      relatedInvoiceId,
      relatedQuoteId,
      expiresAt
    } = body
    
    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, message, type' 
      }, { status: 400 })
    }
    
    // Create notification
    const notification = new Notification({
      userId: session.user.id,
      companyId: session.user.companyId,
      title,
      message,
      type,
      priority,
      data: data || {},
      relatedTaskId,
      relatedActivityId,
      relatedLeadId,
      relatedOpportunityId,
      relatedCustomerId,
      relatedOrderId,
      relatedInvoiceId,
      relatedQuoteId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    })
    
    await notification.save()
    
    // Populate the response
    await notification.populate([
      { path: 'relatedTaskId', select: 'title status' },
      { path: 'relatedActivityId', select: 'subject type' },
      { path: 'relatedLeadId', select: 'name company' },
      { path: 'relatedOpportunityId', select: 'title stage' },
      { path: 'relatedCustomerId', select: 'companyName contactPerson' },
      { path: 'relatedOrderId', select: 'orderNumber status' },
      { path: 'relatedInvoiceId', select: 'invoiceNumber status' },
      { path: 'relatedQuoteId', select: 'quoteNumber status' }
    ])
    
    return NextResponse.json({
      success: true,
      data: notification
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create notification' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    // Get user session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { notificationIds, action } = body
    
    if (!notificationIds || !Array.isArray(notificationIds) || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: notificationIds, action' 
      }, { status: 400 })
    }
    
    let updateData: any = {}
    
    switch (action) {
      case 'markAsRead':
        updateData = { isRead: true, readAt: new Date() }
        break
      case 'markAsUnread':
        updateData = { isRead: false, readAt: null }
        break
      case 'delete':
        // Delete notifications
        await Notification.deleteMany({
          _id: { $in: notificationIds },
          userId: session.user.id
        })
        return NextResponse.json({
          success: true,
          message: 'Notifications deleted successfully'
        })
      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 })
    }
    
    // Update notifications
    const result = await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId: session.user.id
      },
      updateData
    )
    
    return NextResponse.json({
      success: true,
      message: `Notifications ${action} successfully`,
      modifiedCount: result.modifiedCount
    })
    
  } catch (error) {
    console.error('Update notifications error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update notifications' 
    }, { status: 500 })
  }
}
