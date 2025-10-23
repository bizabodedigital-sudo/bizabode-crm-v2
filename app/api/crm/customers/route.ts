import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/lib/models/Customer'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const category = searchParams.get('category')
    const customerType = searchParams.get('customerType')
    const territory = searchParams.get('territory')
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 })
    }

    // Build query
    const query: any = { companyId }
    
    if (category) query.category = category
    if (customerType) query.customerType = customerType
    if (territory) query.territory = territory
    if (status) query.status = status
    if (assignedTo) query.assignedTo = assignedTo
    
    // Text search
    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }

    // Get customers with pagination
    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    const total = await Customer.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get customers error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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
      companyName,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
      category,
      customerType,
      territory,
      assignedTo,
      paymentTerms,
      creditLimit,
      notes,
      businessType,
      industry,
      employeeCount,
      annualRevenue,
      website,
      preferredContactMethod,
      preferredDeliveryTime,
      specialInstructions
    } = body

    // Validate required fields
    if (!companyId || !companyName || !contactPerson || !email || !phone || !category || !customerType) {
      return NextResponse.json({ 
        error: 'Missing required fields: companyId, companyName, contactPerson, email, phone, category, customerType' 
      }, { status: 400 })
    }

    // Create customer
    const customer = new Customer({
      companyId,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      postalCode,
      country: country || 'Jamaica',
      category,
      customerType,
      territory,
      assignedTo,
      paymentTerms: paymentTerms || 'Net 30',
      creditLimit,
      notes,
      businessType,
      industry,
      employeeCount,
      annualRevenue,
      website,
      preferredContactMethod,
      preferredDeliveryTime,
      specialInstructions,
      status: 'Prospect',
      currentBalance: 0,
      creditUsed: 0,
      creditAvailable: creditLimit || 0,
      totalOrders: 0,
      totalValue: 0,
      averageOrderValue: 0
    })

    await customer.save()

    // Populate the response
    await customer.populate('assignedTo', 'name email')

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Create customer error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
