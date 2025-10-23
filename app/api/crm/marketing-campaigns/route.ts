import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import MarketingCampaign from '@/lib/models/MarketingCampaign'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
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
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Get campaigns with pagination
    const campaigns = await MarketingCampaign.find(query)
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await MarketingCampaign.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get marketing campaigns error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketing campaigns' },
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
      status,
      startDate,
      endDate,
      budget,
      currency,
      targetAudience,
      content,
      delivery,
      goals,
      createdBy,
      isActive,
      tags,
      notes
    } = body

    // Validate required fields
    if (!companyId || !name || !description || !type || !startDate || !endDate || !targetAudience || !content || !createdBy) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, name, description, type, startDate, endDate, targetAudience, content, createdBy' 
      }, { status: 400 })
    }

    // Create campaign
    const campaign = new MarketingCampaign({
      companyId,
      name,
      description,
      type,
      status: status || 'Draft',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      currency: currency || 'USD',
      targetAudience,
      content,
      delivery: delivery || { method: 'Immediate' },
      metrics: {
        totalSent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        unsubscribed: 0,
        bounced: 0,
        conversionRate: 0,
        revenue: 0
      },
      goals: goals || {},
      createdBy,
      isActive: isActive !== false,
      tags: tags || [],
      notes
    })

    await campaign.save()

    // Populate the response
    await campaign.populate([
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Marketing campaign created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create marketing campaign error:', error)
    return NextResponse.json(
      { error: 'Failed to create marketing campaign' },
      { status: 500 }
    )
  }
}
