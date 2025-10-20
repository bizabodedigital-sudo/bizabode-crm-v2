import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { connectDB } from '@/lib/db'
import Employee from '@/lib/models/Employee'
import mongoose from 'mongoose'

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

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 })
    }

    const employee = await Employee.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })
      .populate('managerId', 'firstName lastName position email')
      .populate('createdBy', 'name email')

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: employee
    })

  } catch (error) {
    console.error('Get employee error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
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

    const { id } = await params
    const body = await request.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 })
    }

    const employee = await Employee.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Check for email conflicts if email is being updated
    if (body.email && body.email !== employee.email) {
      const existingEmail = await Employee.findOne({
        companyId: authResult.user.companyId,
        email: body.email.toLowerCase(),
        _id: { $ne: id }
      })

      if (existingEmail) {
        return NextResponse.json({ 
          error: 'Email already exists' 
        }, { status: 400 })
      }
    }

    // Check for employee ID conflicts if employee ID is being updated
    if (body.employeeId && body.employeeId !== employee.employeeId) {
      const existingEmployeeId = await Employee.findOne({
        companyId: authResult.user.companyId,
        employeeId: body.employeeId,
        _id: { $ne: id }
      })

      if (existingEmployeeId) {
        return NextResponse.json({ 
          error: 'Employee ID already exists' 
        }, { status: 400 })
      }
    }

    // Update fields
    const updateData: any = {}
    
    if (body.firstName) updateData.firstName = body.firstName
    if (body.lastName) updateData.lastName = body.lastName
    if (body.email) updateData.email = body.email.toLowerCase()
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.address) updateData.address = body.address
    if (body.position) updateData.position = body.position
    if (body.department) updateData.department = body.department
    if (body.managerId !== undefined) updateData.managerId = body.managerId
    if (body.salary !== undefined) updateData.salary = body.salary
    if (body.hourlyRate !== undefined) updateData.hourlyRate = body.hourlyRate
    if (body.employmentType) updateData.employmentType = body.employmentType
    if (body.status) updateData.status = body.status
    if (body.emergencyContact) updateData.emergencyContact = body.emergencyContact
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.employeeId) updateData.employeeId = body.employeeId

    Object.assign(employee, updateData)
    await employee.save()

    // Populate the response
    await employee.populate([
      { path: 'managerId', select: 'firstName lastName position email' },
      { path: 'createdBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    })

  } catch (error) {
    console.error('Update employee error:', error)
    return NextResponse.json(
      { error: 'Failed to update employee' },
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

    const { id } = await params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 })
    }

    const employee = await Employee.findOne({
      _id: id,
      companyId: authResult.user.companyId
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Soft delete by changing status to terminated
    employee.status = 'terminated'
    await employee.save()

    return NextResponse.json({
      success: true,
      message: 'Employee terminated successfully'
    })

  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json(
      { error: 'Failed to terminate employee' },
      { status: 500 }
    )
  }
}
