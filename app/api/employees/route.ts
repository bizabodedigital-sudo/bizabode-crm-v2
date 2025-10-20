import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Employee from '@/lib/models/Employee'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (department) {
      query.department = department
    }
    
    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ]
    }

    const employees = await Employee.find(query)
      .populate('managerId', 'firstName lastName position')
      .populate('createdBy', 'name email')
      .sort({ lastName: 1, firstName: 1 })

    return NextResponse.json({
      success: true,
      data: employees
    })

  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
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
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      address,
      position,
      department,
      managerId,
      hireDate,
      salary,
      hourlyRate,
      employmentType,
      emergencyContact,
      notes
    } = body

    // Validate required fields
    if (!employeeId || !firstName || !lastName || !email || !position || !department || !hireDate || !salary || !employmentType) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({
      companyId: authResult.user.companyId,
      employeeId: employeeId
    })

    if (existingEmployee) {
      return NextResponse.json({ 
        error: 'Employee ID already exists' 
      }, { status: 400 })
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({
      companyId: authResult.user.companyId,
      email: email.toLowerCase()
    })

    if (existingEmail) {
      return NextResponse.json({ 
        error: 'Email already exists' 
      }, { status: 400 })
    }

    // Create employee
    const employee = new Employee({
      companyId: authResult.user.companyId,
      employeeId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      address,
      position,
      department,
      managerId,
      hireDate: new Date(hireDate),
      salary,
      hourlyRate,
      employmentType,
      emergencyContact,
      notes,
      createdBy: authResult.user.id,
      status: 'active'
    })

    await employee.save()

    // Populate the response
    await employee.populate([
      { path: 'managerId', select: 'firstName lastName position' },
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee created successfully'
    })

  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    )
  }
}
