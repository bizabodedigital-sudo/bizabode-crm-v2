import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import CreditLimit from '@/lib/models/CreditLimit'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const customerId = searchParams.get('customerId')
    const riskLevel = searchParams.get('riskLevel')
    const creditHold = searchParams.get('creditHold')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (customerId) query.customerId = customerId
    if (riskLevel) query.riskLevel = riskLevel
    if (creditHold !== null) query.creditHold = creditHold === 'true'

    // Get credit limits with pagination
    const creditLimits = await CreditLimit.find(query)
      .populate('customerId', 'companyName contactPerson email phone')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await CreditLimit.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: creditLimits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get credit limits error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit limits' },
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
      creditLimit,
      paymentTerms,
      approvedBy,
      notes
    } = body

    // Validate required fields
    if (!companyId || !customerId || !creditLimit || !paymentTerms) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, customerId, creditLimit, paymentTerms' 
      }, { status: 400 })
    }

    // Check if credit limit already exists for this customer
    const existingCreditLimit = await CreditLimit.findOne({ companyId, customerId })
    if (existingCreditLimit) {
      return NextResponse.json({ 
        error: 'Credit limit already exists for this customer' 
      }, { status: 400 })
    }

    // Create credit limit
    const creditLimitRecord = new CreditLimit({
      companyId,
      customerId,
      creditLimit,
      paymentTerms,
      approvedBy,
      notes,
      currentBalance: 0,
      creditUsed: 0,
      creditAvailable: creditLimit,
      creditHold: false,
      riskLevel: 'Medium'
    })

    await creditLimitRecord.save()

    // Populate the response
    await creditLimitRecord.populate([
      { path: 'customerId', select: 'companyName contactPerson email phone' },
      { path: 'approvedBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: creditLimitRecord,
      message: 'Credit limit created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create credit limit error:', error)
    return NextResponse.json(
      { error: 'Failed to create credit limit' },
      { status: 500 }
    )
  }
}
