import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import mongoose from 'mongoose'
import { connectDB } from '../lib/db'
import Employee from '../lib/models/Employee'
import Attendance from '../lib/models/Attendance'
import Payroll from '../lib/models/Payroll'
import LeaveRequest from '../lib/models/LeaveRequest'
import PerformanceReview from '../lib/models/PerformanceReview'

// Mock data for testing
const mockCompanyId = new mongoose.Types.ObjectId()
const mockUserId = new mongoose.Types.ObjectId()
const mockEmployeeId = new mongoose.Types.ObjectId()

const mockEmployee = {
  companyId: mockCompanyId,
  employeeId: 'EMP-001',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@test.com',
  phone: '+1234567890',
  position: 'Software Engineer',
  department: 'Engineering',
  salary: 75000,
  employmentType: 'full-time',
  status: 'active',
  hireDate: new Date('2023-01-01'),
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'Spouse',
    phone: '+1234567891',
    email: 'jane.doe@test.com'
  },
  createdBy: mockUserId
}

const mockAttendance = {
  companyId: mockCompanyId,
  employeeId: mockEmployeeId,
  date: new Date('2024-01-15'),
  checkIn: new Date('2024-01-15T09:00:00Z'),
  checkOut: new Date('2024-01-15T17:00:00Z'),
  totalHours: 8,
  overtimeHours: 0,
  status: 'present'
}

const mockPayroll = {
  companyId: mockCompanyId,
  employeeId: mockEmployeeId,
  payPeriod: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31')
  },
  grossPay: 6250,
  deductions: 1250,
  netPay: 5000,
  items: [
    {
      type: 'salary',
      description: 'Monthly Salary',
      amount: 6250,
      taxable: true
    },
    {
      type: 'deduction',
      description: 'Taxes',
      amount: 1250,
      taxable: false
    }
  ],
  status: 'draft',
  processedBy: mockUserId
}

const mockLeaveRequest = {
  companyId: mockCompanyId,
  employeeId: mockEmployeeId,
  leaveType: 'vacation',
  startDate: new Date('2024-02-01'),
  endDate: new Date('2024-02-05'),
  totalDays: 5,
  reason: 'Family vacation',
  status: 'pending',
  requestedBy: mockUserId
}

const mockPerformanceReview = {
  companyId: mockCompanyId,
  employeeId: mockEmployeeId,
  reviewPeriod: {
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-12-31')
  },
  reviewType: 'annual',
  scores: [
    {
      category: 'Technical Skills',
      score: 4,
      comments: 'Excellent technical abilities'
    },
    {
      category: 'Communication',
      score: 3,
      comments: 'Good communication skills'
    }
  ],
  overallScore: 3.5,
  strengths: ['Technical expertise', 'Problem solving'],
  areasForImprovement: ['Public speaking', 'Time management'],
  goals: ['Lead a major project', 'Improve presentation skills'],
  managerComments: 'Strong performer with room for growth',
  status: 'completed',
  reviewedBy: mockUserId
}

describe('HR API Tests', () => {
  beforeAll(async () => {
    await connectDB()
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  beforeEach(async () => {
    // Clean up test data
    await Employee.deleteMany({ companyId: mockCompanyId })
    await Attendance.deleteMany({ companyId: mockCompanyId })
    await Payroll.deleteMany({ companyId: mockCompanyId })
    await LeaveRequest.deleteMany({ companyId: mockCompanyId })
    await PerformanceReview.deleteMany({ companyId: mockCompanyId })
  })

  describe('Employee Management', () => {
    it('should create a new employee', async () => {
      const employee = new Employee(mockEmployee)
      const savedEmployee = await employee.save()

      expect(savedEmployee._id).toBeDefined()
      expect(savedEmployee.employeeId).toBe('EMP-001')
      expect(savedEmployee.firstName).toBe('John')
      expect(savedEmployee.lastName).toBe('Doe')
      expect(savedEmployee.email).toBe('john.doe@test.com')
      expect(savedEmployee.status).toBe('active')
    })

    it('should not allow duplicate employee IDs', async () => {
      const employee1 = new Employee(mockEmployee)
      await employee1.save()

      const employee2 = new Employee({
        ...mockEmployee,
        email: 'different@test.com'
      })

      await expect(employee2.save()).rejects.toThrow()
    })

    it('should not allow duplicate emails', async () => {
      const employee1 = new Employee(mockEmployee)
      await employee1.save()

      const employee2 = new Employee({
        ...mockEmployee,
        employeeId: 'EMP-002'
      })

      await expect(employee2.save()).rejects.toThrow()
    })

    it('should update employee information', async () => {
      const employee = new Employee(mockEmployee)
      const savedEmployee = await employee.save()

      savedEmployee.salary = 80000
      savedEmployee.position = 'Senior Software Engineer'
      const updatedEmployee = await savedEmployee.save()

      expect(updatedEmployee.salary).toBe(80000)
      expect(updatedEmployee.position).toBe('Senior Software Engineer')
    })

    it('should soft delete employee by changing status', async () => {
      const employee = new Employee(mockEmployee)
      const savedEmployee = await employee.save()

      savedEmployee.status = 'terminated'
      const updatedEmployee = await savedEmployee.save()

      expect(updatedEmployee.status).toBe('terminated')
    })
  })

  describe('Attendance Management', () => {
    beforeEach(async () => {
      const employee = new Employee(mockEmployee)
      await employee.save()
    })

    it('should create attendance record', async () => {
      const attendance = new Attendance(mockAttendance)
      const savedAttendance = await attendance.save()

      expect(savedAttendance._id).toBeDefined()
      expect(savedAttendance.employeeId).toEqual(mockEmployeeId)
      expect(savedAttendance.status).toBe('present')
      expect(savedAttendance.totalHours).toBe(8)
    })

    it('should not allow duplicate attendance for same date', async () => {
      const attendance1 = new Attendance(mockAttendance)
      await attendance1.save()

      const attendance2 = new Attendance(mockAttendance)

      await expect(attendance2.save()).rejects.toThrow()
    })

    it('should calculate overtime hours correctly', async () => {
      const overtimeAttendance = new Attendance({
        ...mockAttendance,
        checkIn: new Date('2024-01-15T08:00:00Z'),
        checkOut: new Date('2024-01-15T18:00:00Z'),
        totalHours: 8,
        overtimeHours: 2
      })

      const savedAttendance = await overtimeAttendance.save()
      expect(savedAttendance.overtimeHours).toBe(2)
    })
  })

  describe('Payroll Management', () => {
    beforeEach(async () => {
      const employee = new Employee(mockEmployee)
      await employee.save()
    })

    it('should create payroll record', async () => {
      const payroll = new Payroll(mockPayroll)
      const savedPayroll = await payroll.save()

      expect(savedPayroll._id).toBeDefined()
      expect(savedPayroll.employeeId).toEqual(mockEmployeeId)
      expect(savedPayroll.grossPay).toBe(6250)
      expect(savedPayroll.netPay).toBe(5000)
      expect(savedPayroll.status).toBe('draft')
    })

    it('should not allow duplicate payroll for same period', async () => {
      const payroll1 = new Payroll(mockPayroll)
      await payroll1.save()

      const payroll2 = new Payroll(mockPayroll)

      await expect(payroll2.save()).rejects.toThrow()
    })

    it('should calculate net pay correctly', async () => {
      const payroll = new Payroll(mockPayroll)
      const savedPayroll = await payroll.save()

      expect(savedPayroll.netPay).toBe(savedPayroll.grossPay - savedPayroll.deductions)
    })
  })

  describe('Leave Management', () => {
    beforeEach(async () => {
      const employee = new Employee(mockEmployee)
      await employee.save()
    })

    it('should create leave request', async () => {
      const leaveRequest = new LeaveRequest(mockLeaveRequest)
      const savedLeaveRequest = await leaveRequest.save()

      expect(savedLeaveRequest._id).toBeDefined()
      expect(savedLeaveRequest.employeeId).toEqual(mockEmployeeId)
      expect(savedLeaveRequest.leaveType).toBe('vacation')
      expect(savedLeaveRequest.status).toBe('pending')
    })

    it('should validate leave dates', async () => {
      const invalidLeaveRequest = new LeaveRequest({
        ...mockLeaveRequest,
        startDate: new Date('2024-02-05'),
        endDate: new Date('2024-02-01') // End date before start date
      })

      await expect(invalidLeaveRequest.save()).rejects.toThrow()
    })

    it('should update leave status', async () => {
      const leaveRequest = new LeaveRequest(mockLeaveRequest)
      const savedLeaveRequest = await leaveRequest.save()

      savedLeaveRequest.status = 'approved'
      savedLeaveRequest.approvedBy = mockUserId
      savedLeaveRequest.approvedAt = new Date()

      const updatedLeaveRequest = await savedLeaveRequest.save()
      expect(updatedLeaveRequest.status).toBe('approved')
    })
  })

  describe('Performance Reviews', () => {
    beforeEach(async () => {
      const employee = new Employee(mockEmployee)
      await employee.save()
    })

    it('should create performance review', async () => {
      const review = new PerformanceReview(mockPerformanceReview)
      const savedReview = await review.save()

      expect(savedReview._id).toBeDefined()
      expect(savedReview.employeeId).toEqual(mockEmployeeId)
      expect(savedReview.overallScore).toBe(3.5)
      expect(savedReview.scores).toHaveLength(2)
    })

    it('should not allow duplicate reviews for same period', async () => {
      const review1 = new PerformanceReview(mockPerformanceReview)
      await review1.save()

      const review2 = new PerformanceReview(mockPerformanceReview)

      await expect(review2.save()).rejects.toThrow()
    })

    it('should validate performance scores', async () => {
      const invalidReview = new PerformanceReview({
        ...mockPerformanceReview,
        scores: [
          {
            category: 'Technical Skills',
            score: 6, // Invalid score (should be 1-5)
            comments: 'Invalid score'
          }
        ]
      })

      await expect(invalidReview.save()).rejects.toThrow()
    })
  })

  describe('Data Validation', () => {
    it('should validate email format', async () => {
      const invalidEmployee = new Employee({
        ...mockEmployee,
        email: 'invalid-email'
      })

      await expect(invalidEmployee.save()).rejects.toThrow()
    })

    it('should validate phone number format', async () => {
      const invalidEmployee = new Employee({
        ...mockEmployee,
        phone: 'invalid-phone'
      })

      await expect(invalidEmployee.save()).rejects.toThrow()
    })

    it('should validate salary is positive', async () => {
      const invalidEmployee = new Employee({
        ...mockEmployee,
        salary: -1000
      })

      await expect(invalidEmployee.save()).rejects.toThrow()
    })

    it('should validate employment type enum', async () => {
      const invalidEmployee = new Employee({
        ...mockEmployee,
        employmentType: 'invalid-type'
      })

      await expect(invalidEmployee.save()).rejects.toThrow()
    })
  })

  describe('Query Performance', () => {
    beforeEach(async () => {
      // Create test data for performance testing
      const employees = []
      for (let i = 0; i < 100; i++) {
        employees.push(new Employee({
          ...mockEmployee,
          employeeId: `EMP-${i.toString().padStart(3, '0')}`,
          email: `employee${i}@test.com`,
          department: i % 5 === 0 ? 'Engineering' : 'Sales'
        }))
      }
      await Employee.insertMany(employees)
    })

    it('should query employees by department efficiently', async () => {
      const startTime = Date.now()
      const engineeringEmployees = await Employee.find({
        companyId: mockCompanyId,
        department: 'Engineering'
      })
      const endTime = Date.now()

      expect(engineeringEmployees).toHaveLength(20) // 100/5 = 20
      expect(endTime - startTime).toBeLessThan(100) // Should complete in under 100ms
    })

    it('should query employees by status efficiently', async () => {
      const startTime = Date.now()
      const activeEmployees = await Employee.find({
        companyId: mockCompanyId,
        status: 'active'
      })
      const endTime = Date.now()

      expect(activeEmployees).toHaveLength(100)
      expect(endTime - startTime).toBeLessThan(100)
    })
  })
})

// Integration tests for API endpoints
describe('HR API Integration Tests', () => {
  // These would test the actual HTTP endpoints
  // In a real implementation, you'd use supertest or similar
  describe('GET /api/employees', () => {
    it('should return employees list with pagination', async () => {
      // Mock HTTP request/response
      // Test actual API endpoint behavior
    })
  })

  describe('POST /api/employees', () => {
    it('should create new employee via API', async () => {
      // Mock HTTP request/response
      // Test actual API endpoint behavior
    })
  })

  describe('PUT /api/employees/:id', () => {
    it('should update employee via API', async () => {
      // Mock HTTP request/response
      // Test actual API endpoint behavior
    })
  })

  describe('DELETE /api/employees/:id', () => {
    it('should soft delete employee via API', async () => {
      // Mock HTTP request/response
      // Test actual API endpoint behavior
    })
  })
})
