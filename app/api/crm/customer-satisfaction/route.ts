import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CustomerSatisfaction from '@/lib/models/CustomerSatisfaction'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const customerId = searchParams.get('customerId')
    const rating = searchParams.get('rating')
    const followUpRequired = searchParams.get('followUpRequired')
    const resolved = searchParams.get('resolved')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (customerId) query.customerId = customerId
    if (rating) query.rating = parseInt(rating)
    if (followUpRequired !== null) query.followUpRequired = followUpRequired === 'true'
    if (resolved !== null) query.resolved = resolved === 'true'

    // Get customer satisfaction records with pagination
    const satisfactionRecords = await CustomerSatisfaction.find(query)
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('orderId', 'orderNumber customerName total')
      .populate('invoiceId', 'invoiceNumber customerName total')
      .populate('resolvedBy', 'name email')
      .sort({ responseDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await CustomerSatisfaction.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: satisfactionRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get customer satisfaction error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer satisfaction records' },
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
      customerId,
      orderId,
      invoiceId,
      rating,
      feedback,
      categories,
      wouldRecommend,
      issues,
      improvements,
      contactMethod,
      responseDate,
      followUpRequired,
      followUpDate,
      followUpNotes
    } = body

    // Validate required fields
    if (!companyId || !customerId || !rating || !wouldRecommend || !contactMethod || !responseDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, customerId, rating, wouldRecommend, contactMethod, responseDate' 
      }, { status: 400 })
    }

    // Create customer satisfaction record
    const satisfactionRecord = new CustomerSatisfaction({
      companyId,
      customerId,
      orderId,
      invoiceId,
      rating,
      feedback,
      categories,
      wouldRecommend,
      issues,
      improvements,
      contactMethod,
      responseDate: new Date(responseDate),
      followUpRequired: followUpRequired || false,
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      followUpNotes,
      resolved: false
    })

    await satisfactionRecord.save()

    // Populate the response
    await satisfactionRecord.populate([
      { path: 'customerId', select: 'companyName contactPerson email phone' },
      { path: 'orderId', select: 'orderNumber customerName total' },
      { path: 'invoiceId', select: 'invoiceNumber customerName total' }
    ])

    return NextResponse.json({
      success: true,
      data: satisfactionRecord,
      message: 'Customer satisfaction record created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create customer satisfaction error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer satisfaction record' },
      { status: 500 }
    )
  }
}
