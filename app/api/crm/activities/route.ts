import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Activity from '@/lib/models/Activity'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const leadId = searchParams.get('leadId')
    const opportunityId = searchParams.get('opportunityId')
    const customerId = searchParams.get('customerId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (leadId) query.leadId = leadId
    if (opportunityId) query.opportunityId = opportunityId
    if (customerId) query.customerId = customerId
    if (type) query.type = type
    if (status) query.status = status
    if (assignedTo) query.assignedTo = assignedTo

    // Get activities with pagination
    const activities = await Activity.find(query)
      .populate('leadId', 'name company email')
      .populate('opportunityId', 'title customerName value')
      .populate('customerId', 'companyName contactPerson email')
      .populate('assignedTo', 'name email')
      .populate('relatedQuoteId', 'quoteNumber customerName total')
      .populate('relatedOrderId', 'orderNumber customerName total')
      .populate('relatedInvoiceId', 'invoiceNumber customerName total')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Activity.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get activities error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      companyId,
      leadId,
      opportunityId,
      customerId,
      type,
      subject,
      description,
      duration,
      outcome,
      scheduledDate,
      assignedTo,
      priority,
      location,
      attachments,
      relatedQuoteId,
      relatedOrderId,
      relatedInvoiceId,
      nextFollowUpDate
    } = body

    // Validate required fields
    if (!companyId || !type || !subject || !description || !assignedTo) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, type, subject, description, assignedTo' 
      }, { status: 400 })
    }

    // Create activity
    const activity = new Activity({
      companyId,
      leadId,
      opportunityId,
      customerId,
      type,
      subject,
      description,
      duration,
      outcome,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      assignedTo,
      priority: priority || 'Medium',
      location,
      attachments: attachments || [],
      relatedQuoteId,
      relatedOrderId,
      relatedInvoiceId,
      nextFollowUpDate: nextFollowUpDate ? new Date(nextFollowUpDate) : undefined,
      status: 'Scheduled'
    })

    await activity.save()

    // Populate the response
    await activity.populate([
      { path: 'leadId', select: 'name company email' },
      { path: 'opportunityId', select: 'title customerName value' },
      { path: 'customerId', select: 'companyName contactPerson email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'relatedQuoteId', select: 'quoteNumber customerName total' },
      { path: 'relatedOrderId', select: 'orderNumber customerName total' },
      { path: 'relatedInvoiceId', select: 'invoiceNumber customerName total' }
    ])

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create activity error:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
