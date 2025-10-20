import { NextRequest, NextResponse } from 'next/server'
import { Feedback } from '@/lib/models/Feedback'
import { connectDB } from '@/lib/db'
import { authenticateToken } from '@/lib/middleware/auth'
import { authorizeRole } from '@/lib/middleware/rbac'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const skip = (page - 1) * limit

    const query: any = { companyId: authResult.user.companyId }
    
    if (status) query.status = status
    if (type) query.type = type
    if (priority) query.priority = priority
    if (assignedTo) query.assignedTo = assignedTo

    const feedback = await Feedback.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Feedback.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
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
    const {
      customerName,
      customerEmail,
      customerPhone,
      orderNumber,
      invoiceNumber,
      deliveryId,
      type,
      priority = 'medium',
      subject,
      description,
      rating,
      attachments = []
    } = body

    // Validate required fields
    if (!customerName || !customerEmail || !type || !subject || !description) {
      return NextResponse.json(
        { error: 'Customer name, email, type, subject, and description are required' },
        { status: 400 }
      )
    }

    const feedback = new Feedback({
      companyId: authResult.user.companyId,
      customerName,
      customerEmail,
      customerPhone,
      orderNumber,
      invoiceNumber,
      deliveryId,
      type,
      priority,
      subject,
      description,
      rating,
      attachments,
      createdBy: authResult.user.id
    })

    await feedback.save()

    // Populate the response
    await feedback.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create feedback error:', error)
    return NextResponse.json(
      { error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
}
