import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Employee from '@/lib/models/Employee'
import Attendance from '@/lib/models/Attendance'
import Payroll from '@/lib/models/Payroll'
import LeaveRequest from '@/lib/models/LeaveRequest'
import PerformanceReview from '@/lib/models/PerformanceReview'
import { authenticateToken } from '@/lib/middleware/auth'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const department = searchParams.get('department')

    // Build base query
    const baseQuery: any = { companyId: authResult.user.companyId }
    if (department) baseQuery.department = department

    // Date range query
    const dateQuery: any = {}
    if (startDate && endDate) {
      dateQuery.$gte = new Date(startDate)
      dateQuery.$lte = new Date(endDate)
    }

    let reportData: any = {}

    switch (reportType) {
      case 'overview':
        reportData = await generateOverviewReport(baseQuery, dateQuery)
        break
      case 'attendance':
        reportData = await generateAttendanceReport(baseQuery, dateQuery)
        break
      case 'payroll':
        reportData = await generatePayrollReport(baseQuery, dateQuery)
        break
      case 'performance':
        reportData = await generatePerformanceReport(baseQuery, dateQuery)
        break
      case 'leaves':
        reportData = await generateLeavesReport(baseQuery, dateQuery)
        break
      case 'departments':
        reportData = await generateDepartmentsReport(baseQuery)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Generate HR report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}

async function generateOverviewReport(baseQuery: any, dateQuery: any) {
  const [
    totalEmployees,
    activeEmployees,
    departments,
    recentHires,
    upcomingReviews,
    pendingLeaves
  ] = await Promise.all([
    Employee.countDocuments(baseQuery),
    Employee.countDocuments({ ...baseQuery, status: 'active' }),
    Employee.distinct('department', baseQuery),
    Employee.find({ ...baseQuery, status: 'active' })
      .sort({ hireDate: -1 })
      .limit(5)
      .select('firstName lastName hireDate position'),
    PerformanceReview.find({ ...baseQuery, status: 'pending' })
      .populate('employeeId', 'firstName lastName')
      .limit(5),
    LeaveRequest.find({ ...baseQuery, status: 'pending' })
      .populate('employeeId', 'firstName lastName')
      .limit(5)
  ])

  return {
    summary: {
      totalEmployees,
      activeEmployees,
      departments: departments.length,
      recentHires,
      upcomingReviews,
      pendingLeaves
    },
    departments: departments.map(dept => ({ name: dept }))
  }
}

async function generateAttendanceReport(baseQuery: any, dateQuery: any) {
  const attendanceQuery = { ...baseQuery }
  if (Object.keys(dateQuery).length > 0) {
    attendanceQuery.date = dateQuery
  }

  const [
    totalRecords,
    presentCount,
    absentCount,
    lateCount,
    averageHours,
    topPerformers
  ] = await Promise.all([
    Attendance.countDocuments(attendanceQuery),
    Attendance.countDocuments({ ...attendanceQuery, status: 'present' }),
    Attendance.countDocuments({ ...attendanceQuery, status: 'absent' }),
    Attendance.countDocuments({ ...attendanceQuery, status: 'late' }),
    Attendance.aggregate([
      { $match: attendanceQuery },
      { $group: { _id: null, avgHours: { $avg: '$totalHours' } } }
    ]),
    Attendance.aggregate([
      { $match: attendanceQuery },
      { $group: { _id: '$employeeId', totalHours: { $sum: '$totalHours' } } },
      { $sort: { totalHours: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      }
    ])
  ])

  return {
    summary: {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      attendanceRate: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0,
      averageHours: averageHours[0]?.avgHours || 0
    },
    topPerformers: topPerformers.map(perf => ({
      employee: perf.employee[0],
      totalHours: perf.totalHours
    }))
  }
}

async function generatePayrollReport(baseQuery: any, dateQuery: any) {
  const payrollQuery = { ...baseQuery }
  if (Object.keys(dateQuery).length > 0) {
    payrollQuery['payPeriod.startDate'] = dateQuery
  }

  const [
    totalPayrolls,
    totalGrossPay,
    totalDeductions,
    totalNetPay,
    averageSalary,
    departmentBreakdown
  ] = await Promise.all([
    Payroll.countDocuments(payrollQuery),
    Payroll.aggregate([
      { $match: payrollQuery },
      { $group: { _id: null, total: { $sum: '$grossPay' } } }
    ]),
    Payroll.aggregate([
      { $match: payrollQuery },
      { $group: { _id: null, total: { $sum: '$deductions' } } }
    ]),
    Payroll.aggregate([
      { $match: payrollQuery },
      { $group: { _id: null, total: { $sum: '$netPay' } } }
    ]),
    Employee.aggregate([
      { $match: baseQuery },
      { $group: { _id: null, avgSalary: { $avg: '$salary' } } }
    ]),
    Employee.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$department', avgSalary: { $avg: '$salary' }, count: { $sum: 1 } } }
    ])
  ])

  return {
    summary: {
      totalPayrolls,
      totalGrossPay: totalGrossPay[0]?.total || 0,
      totalDeductions: totalDeductions[0]?.total || 0,
      totalNetPay: totalNetPay[0]?.total || 0,
      averageSalary: averageSalary[0]?.avgSalary || 0
    },
    departmentBreakdown: departmentBreakdown.map(dept => ({
      department: dept._id,
      averageSalary: dept.avgSalary,
      employeeCount: dept.count
    }))
  }
}

async function generatePerformanceReport(baseQuery: any, dateQuery: any) {
  const performanceQuery = { ...baseQuery }
  if (Object.keys(dateQuery).length > 0) {
    performanceQuery['reviewPeriod.startDate'] = dateQuery
  }

  const [
    totalReviews,
    averageScore,
    scoreDistribution,
    topPerformers,
    improvementAreas
  ] = await Promise.all([
    PerformanceReview.countDocuments(performanceQuery),
    PerformanceReview.aggregate([
      { $match: performanceQuery },
      { $group: { _id: null, avgScore: { $avg: '$overallScore' } } }
    ]),
    PerformanceReview.aggregate([
      { $match: performanceQuery },
      {
        $bucket: {
          groupBy: '$overallScore',
          boundaries: [1, 2, 3, 4, 5, 6],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]),
    PerformanceReview.find(performanceQuery)
      .sort({ overallScore: -1 })
      .limit(5)
      .populate('employeeId', 'firstName lastName position')
      .select('overallScore managerComments'),
    PerformanceReview.aggregate([
      { $match: performanceQuery },
      { $unwind: '$areasForImprovement' },
      { $group: { _id: '$areasForImprovement', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
  ])

  return {
    summary: {
      totalReviews,
      averageScore: averageScore[0]?.avgScore || 0,
      scoreDistribution
    },
    topPerformers: topPerformers.map(perf => ({
      employee: perf.employeeId,
      score: perf.overallScore,
      comments: perf.managerComments
    })),
    improvementAreas: improvementAreas.map(area => ({
      area: area._id,
      frequency: area.count
    }))
  }
}

async function generateLeavesReport(baseQuery: any, dateQuery: any) {
  const leavesQuery = { ...baseQuery }
  if (Object.keys(dateQuery).length > 0) {
    leavesQuery.startDate = dateQuery
  }

  const [
    totalLeaves,
    approvedLeaves,
    pendingLeaves,
    rejectedLeaves,
    leaveTypes,
    departmentLeaves
  ] = await Promise.all([
    LeaveRequest.countDocuments(leavesQuery),
    LeaveRequest.countDocuments({ ...leavesQuery, status: 'approved' }),
    LeaveRequest.countDocuments({ ...leavesQuery, status: 'pending' }),
    LeaveRequest.countDocuments({ ...leavesQuery, status: 'rejected' }),
    LeaveRequest.aggregate([
      { $match: leavesQuery },
      { $group: { _id: '$leaveType', count: { $sum: 1 }, totalDays: { $sum: '$totalDays' } } }
    ]),
    LeaveRequest.aggregate([
      { $match: leavesQuery },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      { $group: { _id: '$employee.department', count: { $sum: 1 }, totalDays: { $sum: '$totalDays' } } }
    ])
  ])

  return {
    summary: {
      totalLeaves,
      approvedLeaves,
      pendingLeaves,
      rejectedLeaves,
      approvalRate: totalLeaves > 0 ? (approvedLeaves / totalLeaves) * 100 : 0
    },
    leaveTypes: leaveTypes.map(type => ({
      type: type._id,
      count: type.count,
      totalDays: type.totalDays
    })),
    departmentLeaves: departmentLeaves.map(dept => ({
      department: dept._id,
      count: dept.count,
      totalDays: dept.totalDays
    }))
  }
}

async function generateDepartmentsReport(baseQuery: any) {
  const departmentStats = await Employee.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: '$department',
        totalEmployees: { $sum: 1 },
        activeEmployees: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        averageSalary: { $avg: '$salary' },
        employmentTypes: { $addToSet: '$employmentType' }
      }
    },
    { $sort: { totalEmployees: -1 } }
  ])

  return {
    departments: departmentStats.map(dept => ({
      name: dept._id,
      totalEmployees: dept.totalEmployees,
      activeEmployees: dept.activeEmployees,
      averageSalary: dept.averageSalary,
      employmentTypes: dept.employmentTypes
    }))
  }
}
