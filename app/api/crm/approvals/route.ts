import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Approval from '@/lib/models/Approval'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const requestedBy = searchParams.get('requestedBy')
    const overdue = searchParams.get('overdue')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (type) query.type = type
    if (status) query.status = status
    if (priority) query.priority = priority
    if (requestedBy) query.requestedBy = requestedBy
    if (overdue === 'true') query.isOverdue = true

    // Get approvals with pagination
    const approvals = await Approval.find(query)
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('approvers.userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Approval.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: approvals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
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
      type,
      relatedId,
      relatedType,
      title,
      description,
      requestedBy,
      amount,
      currency,
      priority,
      approvers,
      totalLevels,
      dueDate,
      comments,
      attachments
    } = body

    // Validate required fields
    if (!companyId || !type || !relatedId || !relatedType || !title || !description || !requestedBy || !approvers || !totalLevels) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, type, relatedId, relatedType, title, description, requestedBy, approvers, totalLevels' 
      }, { status: 400 })
    }

    // Create approval
    const approval = new Approval({
      companyId,
      type,
      relatedId,
      relatedType,
      title,
      description,
      requestedBy,
      requestedDate: new Date(),
      amount,
      currency: currency || 'USD',
      priority: priority || 'Medium',
      status: 'Pending',
      approvers,
      currentLevel: 1,
      totalLevels,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      comments,
      attachments: attachments || [],
      isOverdue: false
    })

    await approval.save()

    // Populate the response
    await approval.populate([
      { path: 'requestedBy', select: 'name email' },
      { path: 'approvers.userId', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: approval,
      message: 'Approval request created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create approval error:', error)
    return NextResponse.json(
      { error: 'Failed to create approval request' },
      { status: 500 }
    )
  }
}
