import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Payroll from '@/lib/models/Payroll'
import Employee from '@/lib/models/Employee'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const payrolls = await Payroll.find({ companyId: authResult.user.companyId })
      .populate('employeeId', 'firstName lastName employeeId position department')
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      data: payrolls
    })

  } catch (error) {
    console.error('Get payrolls error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payrolls' },
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
    const { employeeId, payPeriod, items, grossPay, deductions, netPay, paymentDate } = body

    // Verify employee exists and belongs to company
    const employee = await Employee.findOne({
      _id: employeeId,
      companyId: authResult.user.companyId
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    const payroll = new Payroll({
      companyId: authResult.user.companyId,
      employeeId,
      payPeriod,
      items,
      grossPay,
      deductions,
      netPay,
      paymentDate: new Date(paymentDate)
    })

    await payroll.save()

    return NextResponse.json({
      success: true,
      data: payroll,
      message: 'Payroll record created successfully'
    })

  } catch (error) {
    console.error('Create payroll error:', error)
    return NextResponse.json(
      { error: 'Failed to create payroll record' },
      { status: 500 }
    )
  }
}
