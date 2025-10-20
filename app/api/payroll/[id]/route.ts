import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Payroll from '@/lib/models/Payroll'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const resolvedParams = await params
    const payroll = await Payroll.findOne({
      _id: resolvedParams.id,
      companyId: authResult.user.companyId
    }).populate('employeeId', 'firstName lastName employeeId position department')

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: payroll
    })

  } catch (error) {
    console.error('Get payroll error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payroll record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { payPeriod, items, grossPay, deductions, netPay, paymentDate } = body

    const payroll = await Payroll.findOneAndUpdate(
      { _id: resolvedParams.id, companyId: authResult.user.companyId },
      {
        payPeriod,
        items,
        grossPay,
        deductions,
        netPay,
        paymentDate: new Date(paymentDate)
      },
      { new: true }
    ).populate('employeeId', 'firstName lastName employeeId position department')

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: payroll,
      message: 'Payroll record updated successfully'
    })

  } catch (error) {
    console.error('Update payroll error:', error)
    return NextResponse.json(
      { error: 'Failed to update payroll record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const resolvedParams = await params
    const payroll = await Payroll.findOneAndDelete({
      _id: resolvedParams.id,
      companyId: authResult.user.companyId
    })

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Payroll record deleted successfully'
    })

  } catch (error) {
    console.error('Delete payroll error:', error)
    return NextResponse.json(
      { error: 'Failed to delete payroll record' },
      { status: 500 }
    )
  }
}
