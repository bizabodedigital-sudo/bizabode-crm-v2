import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Customer from '@/lib/models/Customer'
import mongoose from 'mongoose'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
    }

    const customer = await Customer.findOne({
      _id: params.id
    })
      .populate('assignedTo', 'name email')

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: customer
    })

  } catch (error) {
    console.error('Get customer error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
    }

    const body = await request.json()
    const {
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
      status,
      rating,
      tags,
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

    const customer = await Customer.findOneAndUpdate(
      {
        _id: params.id
      },
      {
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
        status,
        rating,
        tags,
        notes,
        businessType,
        industry,
        employeeCount,
        annualRevenue,
        website,
        preferredContactMethod,
        preferredDeliveryTime,
        specialInstructions
      },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    })

  } catch (error) {
    console.error('Update customer error:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
    }

    const customer = await Customer.findOneAndDelete({
      _id: params.id
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully'
    })

  } catch (error) {
    console.error('Delete customer error:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}