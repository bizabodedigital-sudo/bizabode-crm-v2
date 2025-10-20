import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

// Employee validation schemas
export const employeeValidation = {
  create: Joi.object({
    employeeId: Joi.string().required().trim().min(1).max(20),
    firstName: Joi.string().required().trim().min(1).max(50),
    lastName: Joi.string().required().trim().min(1).max(50),
    email: Joi.string().email().required().trim().lowercase(),
    phone: Joi.string().optional().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/),
    address: Joi.object({
      street: Joi.string().optional().trim().max(100),
      city: Joi.string().optional().trim().max(50),
      state: Joi.string().optional().trim().max(50),
      zipCode: Joi.string().optional().trim().max(20),
      country: Joi.string().optional().trim().max(50).default('US')
    }).optional(),
    position: Joi.string().required().trim().min(1).max(100),
    department: Joi.string().required().trim().min(1).max(50),
    managerId: Joi.string().optional().pattern(/^[0-9a-fA-F]{24}$/),
    salary: Joi.number().required().min(0).max(10000000),
    hourlyRate: Joi.number().optional().min(0).max(1000),
    employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'intern').required(),
    emergencyContact: Joi.object({
      name: Joi.string().required().trim().min(1).max(100),
      relationship: Joi.string().required().trim().min(1).max(50),
      phone: Joi.string().required().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/),
      email: Joi.string().optional().email().trim().lowercase()
    }).optional(),
    notes: Joi.string().optional().trim().max(1000)
  }),

  update: Joi.object({
    employeeId: Joi.string().optional().trim().min(1).max(20),
    firstName: Joi.string().optional().trim().min(1).max(50),
    lastName: Joi.string().optional().trim().min(1).max(50),
    email: Joi.string().optional().email().trim().lowercase(),
    phone: Joi.string().optional().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/),
    address: Joi.object({
      street: Joi.string().optional().trim().max(100),
      city: Joi.string().optional().trim().max(50),
      state: Joi.string().optional().trim().max(50),
      zipCode: Joi.string().optional().trim().max(20),
      country: Joi.string().optional().trim().max(50)
    }).optional(),
    position: Joi.string().optional().trim().min(1).max(100),
    department: Joi.string().optional().trim().min(1).max(50),
    managerId: Joi.string().optional().pattern(/^[0-9a-fA-F]{24}$/),
    salary: Joi.number().optional().min(0).max(10000000),
    hourlyRate: Joi.number().optional().min(0).max(1000),
    employmentType: Joi.string().optional().valid('full-time', 'part-time', 'contract', 'intern'),
    status: Joi.string().optional().valid('active', 'inactive', 'terminated', 'on-leave'),
    emergencyContact: Joi.object({
      name: Joi.string().optional().trim().min(1).max(100),
      relationship: Joi.string().optional().trim().min(1).max(50),
      phone: Joi.string().optional().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/),
      email: Joi.string().optional().email().trim().lowercase()
    }).optional(),
    notes: Joi.string().optional().trim().max(1000)
  })
}

// Attendance validation schemas
export const attendanceValidation = {
  create: Joi.object({
    employeeId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    date: Joi.date().required(),
    checkIn: Joi.date().optional(),
    checkOut: Joi.date().optional(),
    breakStart: Joi.date().optional(),
    breakEnd: Joi.date().optional(),
    status: Joi.string().valid('present', 'absent', 'late', 'half-day', 'sick', 'vacation', 'holiday').required(),
    notes: Joi.string().optional().trim().max(500)
  }),

  update: Joi.object({
    checkIn: Joi.date().optional(),
    checkOut: Joi.date().optional(),
    breakStart: Joi.date().optional(),
    breakEnd: Joi.date().optional(),
    status: Joi.string().optional().valid('present', 'absent', 'late', 'half-day', 'sick', 'vacation', 'holiday'),
    notes: Joi.string().optional().trim().max(500)
  })
}

// Payroll validation schemas
export const payrollValidation = {
  create: Joi.object({
    employeeId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    payPeriod: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required()
    }).required(),
    items: Joi.array().items(Joi.object({
      type: Joi.string().valid('salary', 'overtime', 'bonus', 'commission', 'allowance', 'deduction').required(),
      description: Joi.string().required().trim().max(200),
      amount: Joi.number().required().min(0).max(1000000),
      taxable: Joi.boolean().default(true)
    })).min(1).required(),
    notes: Joi.string().optional().trim().max(1000)
  }),

  update: Joi.object({
    items: Joi.array().items(Joi.object({
      type: Joi.string().valid('salary', 'overtime', 'bonus', 'commission', 'allowance', 'deduction').required(),
      description: Joi.string().required().trim().max(200),
      amount: Joi.number().required().min(0).max(1000000),
      taxable: Joi.boolean().default(true)
    })).min(1).optional(),
    status: Joi.string().optional().valid('draft', 'approved', 'paid', 'cancelled'),
    paymentDate: Joi.date().optional(),
    paymentMethod: Joi.string().optional().valid('bank_transfer', 'check', 'cash'),
    notes: Joi.string().optional().trim().max(1000)
  })
}

// Leave request validation schemas
export const leaveValidation = {
  create: Joi.object({
    employeeId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    leaveType: Joi.string().valid('vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other').required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required().min(Joi.ref('startDate')),
    reason: Joi.string().required().trim().min(10).max(1000),
    attachments: Joi.array().items(Joi.object({
      name: Joi.string().required().trim().max(200),
      url: Joi.string().required().uri()
    })).optional(),
    notes: Joi.string().optional().trim().max(1000)
  }),

  update: Joi.object({
    leaveType: Joi.string().optional().valid('vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().min(Joi.ref('startDate')),
    reason: Joi.string().optional().trim().min(10).max(1000),
    status: Joi.string().optional().valid('pending', 'approved', 'rejected', 'cancelled'),
    rejectionReason: Joi.string().optional().trim().max(500),
    notes: Joi.string().optional().trim().max(1000)
  })
}

// Performance review validation schemas
export const performanceValidation = {
  create: Joi.object({
    employeeId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    reviewPeriod: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required().min(Joi.ref('startDate'))
    }).required(),
    reviewType: Joi.string().valid('annual', 'quarterly', 'probation', 'project', 'custom').required(),
    scores: Joi.array().items(Joi.object({
      category: Joi.string().required().trim().max(100),
      score: Joi.number().required().min(1).max(5),
      comments: Joi.string().optional().trim().max(500)
    })).min(1).required(),
    overallScore: Joi.number().required().min(1).max(5),
    strengths: Joi.array().items(Joi.string().trim().max(200)).optional(),
    areasForImprovement: Joi.array().items(Joi.string().trim().max(200)).optional(),
    goals: Joi.array().items(Joi.string().trim().max(200)).optional(),
    managerComments: Joi.string().required().trim().min(10).max(2000),
    employeeComments: Joi.string().optional().trim().max(2000),
    nextReviewDate: Joi.date().optional()
  }),

  update: Joi.object({
    scores: Joi.array().items(Joi.object({
      category: Joi.string().required().trim().max(100),
      score: Joi.number().required().min(1).max(5),
      comments: Joi.string().optional().trim().max(500)
    })).min(1).optional(),
    overallScore: Joi.number().optional().min(1).max(5),
    strengths: Joi.array().items(Joi.string().trim().max(200)).optional(),
    areasForImprovement: Joi.array().items(Joi.string().trim().max(200)).optional(),
    goals: Joi.array().items(Joi.string().trim().max(200)).optional(),
    managerComments: Joi.string().optional().trim().min(10).max(2000),
    employeeComments: Joi.string().optional().trim().max(2000),
    status: Joi.string().optional().valid('draft', 'submitted', 'under_review', 'completed', 'cancelled'),
    nextReviewDate: Joi.date().optional()
  })
}

// Time tracking validation schemas
export const timeTrackingValidation = {
  create: Joi.object({
    employeeId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    projectId: Joi.string().optional().pattern(/^[0-9a-fA-F]{24}$/),
    projectName: Joi.string().optional().trim().max(200),
    task: Joi.string().required().trim().min(1).max(200),
    description: Joi.string().optional().trim().max(1000),
    startTime: Joi.date().required(),
    endTime: Joi.date().optional().min(Joi.ref('startTime')),
    isBillable: Joi.boolean().default(false),
    hourlyRate: Joi.number().optional().min(0).max(1000),
    tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
    location: Joi.string().optional().trim().max(100),
    notes: Joi.string().optional().trim().max(1000)
  }),

  update: Joi.object({
    task: Joi.string().optional().trim().min(1).max(200),
    description: Joi.string().optional().trim().max(1000),
    startTime: Joi.date().optional(),
    endTime: Joi.date().optional().min(Joi.ref('startTime')),
    isBillable: Joi.boolean().optional(),
    hourlyRate: Joi.number().optional().min(0).max(1000),
    status: Joi.string().optional().valid('active', 'paused', 'completed', 'approved', 'rejected'),
    tags: Joi.array().items(Joi.string().trim().max(50)).optional(),
    location: Joi.string().optional().trim().max(100),
    notes: Joi.string().optional().trim().max(1000)
  })
}

// Generic validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorDetails
      })
    }
    
    next()
  }
}

// Query parameter validation
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query, { abortEarly: false })
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
      
      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errorDetails
      })
    }
    
    next()
  }
}

// Common query schemas
export const commonQueryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  }),

  dateRange: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional().min(Joi.ref('startDate'))
  }),

  search: Joi.object({
    search: Joi.string().optional().trim().max(100),
    status: Joi.string().optional(),
    department: Joi.string().optional(),
    employeeId: Joi.string().optional().pattern(/^[0-9a-fA-F]{24}$/)
  })
}
