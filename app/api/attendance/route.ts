import { NextRequest, NextResponse } from 'next/server'
import { authenticateToken } from '@/lib/middleware/auth'
import { authenticateEmployeeToken } from '@/lib/middleware/employee-auth'
import { connectDB } from '@/lib/db'
import Attendance from '@/lib/models/Attendance'
import Employee from '@/lib/models/Employee'

// Helper function to authenticate both users and employees
async function authenticateRequest(request: NextRequest) {
  // Try regular user authentication first
  const userAuth = await authenticateToken(request)
  if (userAuth.authenticated) {
    return userAuth
  }
  
  // Try employee authentication
  const employeeAuth = await authenticateEmployeeToken(request)
  if (employeeAuth.authenticated) {
    return employeeAuth
  }
  
  // Return the employee auth error if it has a more specific error
  if (employeeAuth.error && employeeAuth.error !== "No token provided") {
    return employeeAuth
  }
  
  // Otherwise return the user auth error
  return userAuth
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    const today = searchParams.get('today')

    // Build query
    const query: any = { companyId: authResult.user.companyId }
    
    if (employeeId) {
      // If employeeId is a string (like EMP001), find the employee first
      if (typeof employeeId === 'string' && employeeId.startsWith('EMP')) {
        const employee = await Employee.findOne({ employeeId })
        if (employee) {
          query.employeeId = employee._id
        } else {
          return NextResponse.json({
            success: true,
            data: []
          })
        }
      } else {
        query.employeeId = employeeId
      }
    }
    
    if (today === 'true') {
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      const tomorrowDate = new Date(todayDate)
      tomorrowDate.setDate(tomorrowDate.getDate() + 1)
      query.date = {
        $gte: todayDate,
        $lt: tomorrowDate
      }
    }
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }
    
    if (status) {
      query.status = status
    }

    const attendance = await Attendance.find(query)
      .populate('employeeId', 'firstName lastName employeeId position')
      .populate('approvedBy', 'name email')
      .sort({ date: -1 })

    return NextResponse.json({
      success: true,
      data: attendance
    })

  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const {
      employeeId,
      date,
      checkIn,
      checkOut,
      breakStart,
      breakEnd,
      status,
      notes
    } = body

    if (!employeeId || !date) {
      return NextResponse.json({ 
        error: 'Employee ID and date are required' 
      }, { status: 400 })
    }

    // For employee authentication, use the authenticated employee directly
    let employee
    if (authResult.user.role === 'employee') {
      // Use the authenticated employee's ID
      employee = await Employee.findById(authResult.user.id)
      if (!employee) {
        return NextResponse.json({ 
          error: 'Employee not found' 
        }, { status: 404 })
      }
    } else {
      // For regular user authentication, find the employee
      if (typeof employeeId === 'string' && employeeId.startsWith('EMP')) {
        // Find by employeeId string
        employee = await Employee.findOne({
          employeeId,
          companyId: authResult.user.companyId
        })
      } else {
        // Find by ObjectId
        employee = await Employee.findOne({
          _id: employeeId,
          companyId: authResult.user.companyId
        })
      }

      if (!employee) {
        return NextResponse.json({ 
          error: 'Employee not found' 
        }, { status: 404 })
      }
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      companyId: authResult.user.companyId,
      employeeId: employee._id,
      date: new Date(date)
    })

    if (existingAttendance) {
      // If employee is already clocked in, return an error
      if (existingAttendance.checkIn && !existingAttendance.checkOut) {
        return NextResponse.json({ 
          error: 'Employee is already clocked in for today' 
        }, { status: 400 })
      }
      
      // If employee is clocked out, allow them to clock in again (new session)
      // We'll update the existing record instead of creating a new one
    }

    // Calculate total hours if check-in and check-out are provided
    let totalHours = 0
    let overtimeHours = 0

    if (checkIn && checkOut) {
      const checkInTime = new Date(checkIn)
      const checkOutTime = new Date(checkOut)
      
      // Calculate break time if provided
      let breakTime = 0
      if (breakStart && breakEnd) {
        const breakStartTime = new Date(breakStart)
        const breakEndTime = new Date(breakEnd)
        breakTime = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60)
      }

      // Calculate total working hours
      const workingTime = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      totalHours = Math.max(0, workingTime - breakTime)

      // Calculate overtime (assuming 8 hours is standard)
      if (totalHours > 8) {
        overtimeHours = totalHours - 8
        totalHours = 8
      }
    }

    let attendance
    
    if (existingAttendance) {
      // Update existing attendance record
      attendance = existingAttendance
      
      // Update fields
      if (checkIn) attendance.checkIn = new Date(checkIn)
      if (checkOut) attendance.checkOut = new Date(checkOut)
      if (breakStart) attendance.breakStart = new Date(breakStart)
      if (breakEnd) attendance.breakEnd = new Date(breakEnd)
      if (status) attendance.status = status
      if (notes) attendance.notes = notes
      
      // Recalculate total hours if both check-in and check-out are present
      if (attendance.checkIn && attendance.checkOut) {
        const checkInTime = new Date(attendance.checkIn)
        const checkOutTime = new Date(attendance.checkOut)
        
        // Calculate break time if provided
        let breakTime = 0
        if (attendance.breakStart && attendance.breakEnd) {
          const breakStartTime = new Date(attendance.breakStart)
          const breakEndTime = new Date(attendance.breakEnd)
          breakTime = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60)
        }

        // Calculate total working hours
        const workingTime = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
        attendance.totalHours = Math.max(0, workingTime - breakTime)

        // Calculate overtime (assuming 8 hours is standard)
        if (attendance.totalHours > 8) {
          attendance.overtimeHours = attendance.totalHours - 8
          attendance.totalHours = 8
        }
      }
      
      await attendance.save()
    } else {
      // Create new attendance record
      attendance = new Attendance({
        companyId: authResult.user.companyId,
        employeeId: employee._id,
        date: new Date(date),
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        breakStart: breakStart ? new Date(breakStart) : undefined,
        breakEnd: breakEnd ? new Date(breakEnd) : undefined,
        totalHours,
        overtimeHours,
        status: status || 'present',
        notes,
      })

      await attendance.save()
    }

    // Populate the response
    await attendance.populate([
      { path: 'employeeId', select: 'firstName lastName employeeId position' },
      { path: 'approvedBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: attendance,
      message: existingAttendance ? 'Attendance updated successfully' : 'Attendance recorded successfully'
    })

  } catch (error) {
    console.error('Create attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to record attendance' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateRequest(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const body = await request.json()
    const {
      employeeId,
      date,
      checkOut,
      breakStart,
      breakEnd,
      notes
    } = body

    if (!employeeId || !date) {
      return NextResponse.json({ 
        error: 'Employee ID and date are required' 
      }, { status: 400 })
    }

    // For employee authentication, use the authenticated employee directly
    let actualEmployeeId
    if (authResult.user.role === 'employee') {
      // Use the authenticated employee's ID
      actualEmployeeId = authResult.user.id
    } else {
      // For regular user authentication, find the employee
      actualEmployeeId = employeeId
      if (typeof employeeId === 'string' && employeeId.startsWith('EMP')) {
        const employee = await Employee.findOne({
          employeeId,
          companyId: authResult.user.companyId
        })
        if (!employee) {
          return NextResponse.json({ 
            error: 'Employee not found' 
          }, { status: 404 })
        }
        actualEmployeeId = employee._id
      }
    }

    // Find existing attendance record
    const attendance = await Attendance.findOne({
      companyId: authResult.user.companyId,
      employeeId: actualEmployeeId,
      date: new Date(date)
    })

    if (!attendance) {
      return NextResponse.json({ 
        error: 'Attendance record not found' 
      }, { status: 404 })
    }

    // Update fields
    if (checkOut) {
      attendance.checkOut = new Date(checkOut)
    }
    if (breakStart) {
      attendance.breakStart = new Date(breakStart)
    }
    if (breakEnd) {
      attendance.breakEnd = new Date(breakEnd)
    }
    if (notes) {
      attendance.notes = notes
    }

    // Recalculate total hours if both check-in and check-out are present
    if (attendance.checkIn && attendance.checkOut) {
      const checkInTime = new Date(attendance.checkIn)
      const checkOutTime = new Date(attendance.checkOut)
      
      // Calculate break time if provided
      let breakTime = 0
      if (attendance.breakStart && attendance.breakEnd) {
        const breakStartTime = new Date(attendance.breakStart)
        const breakEndTime = new Date(attendance.breakEnd)
        breakTime = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60 * 60)
      }

      // Calculate total working hours
      const workingTime = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      attendance.totalHours = Math.max(0, workingTime - breakTime)

      // Calculate overtime (assuming 8 hours is standard)
      if (attendance.totalHours > 8) {
        attendance.overtimeHours = attendance.totalHours - 8
        attendance.totalHours = 8
      }
    }

    await attendance.save()

    // Populate the response
    await attendance.populate([
      { path: 'employeeId', select: 'firstName lastName employeeId position' },
      { path: 'approvedBy', select: 'name email' }
    ])

    return NextResponse.json({
      success: true,
      data: attendance,
      message: 'Attendance updated successfully'
    })

  } catch (error) {
    console.error('Update attendance error:', error)
    return NextResponse.json(
      { error: 'Failed to update attendance' },
      { status: 500 }
    )
  }
}
