import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Employee from "@/lib/models/Employee"
import { generateEmployeeToken } from "@/lib/middleware/employee-auth"

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const { employeeId, password } = await request.json()

    if (!employeeId || !password) {
      return NextResponse.json({ 
        error: 'Employee ID and password are required' 
      }, { status: 400 })
    }

    // Find employee by employeeId (get the most recent one)
    const employee = await Employee.findOne({ employeeId }).sort({ createdAt: -1 })
    
    if (!employee) {
      return NextResponse.json({ 
        error: 'Invalid employee ID or password' 
      }, { status: 401 })
    }


    // Verify password using bcrypt (proper security)
    const bcrypt = require('bcryptjs')
    const isPasswordValid = await bcrypt.compare(password, employee.password || '')
    
    if (!isPasswordValid) {
      return NextResponse.json({ 
        error: 'Invalid employee ID or password' 
      }, { status: 401 })
    }

    // Create JWT token for employee
    const token = generateEmployeeToken(employee._id.toString(), employee.companyId?.toString() || '')

    return NextResponse.json({
      success: true,
      token,
      employeeId: employee.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Employee login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
