import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Promotion from '@/lib/models/Promotion'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (type) query.type = type
    if (status) query.status = status
    if (isActive !== null) query.isActive = isActive === 'true'

    // Get promotions with pagination
    const promotions = await Promotion.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Promotion.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: promotions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get promotions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
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
      name,
      description,
      type,
      value,
      minOrderValue,
      maxDiscount,
      applicableTo,
      productIds,
      categoryIds,
      customerIds,
      startDate,
      endDate,
      usageLimit,
      conditions,
      notes,
      createdBy
    } = body

    // Validate required fields
    if (!companyId || !name || !description || !type || !value || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, name, description, type, value, startDate, endDate' 
      }, { status: 400 })
    }

    // Create promotion
    const promotion = new Promotion({
      companyId,
      name,
      description,
      type,
      value,
      minOrderValue,
      maxDiscount,
      applicableTo,
      productIds,
      categoryIds,
      customerIds,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit,
      conditions,
      notes,
      createdBy,
      status: 'Draft',
      usageCount: 0
    })

    await promotion.save()

    // Populate the response
    await promotion.populate([
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: promotion,
      message: 'Promotion created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create promotion error:', error)
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    )
  }
}
