import { z } from "zod"

// Employee validation schemas
export const EmployeeLoginSchema = z.object({
  employeeId: z.string()
    .min(1, "Employee ID is required")
    .max(20, "Employee ID must be less than 20 characters")
    .regex(/^EMP\d{3,}$/, "Employee ID must start with EMP followed by 3+ digits"),
  password: z.string()
    .min(1, "Password is required")
    .max(50, "Password must be less than 50 characters")
})

export const ClockInSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  checkIn: z.string().datetime("Check-in time must be a valid datetime"),
  status: z.enum(['present', 'late', 'absent']).default('present')
})

export const ClockOutSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  checkOut: z.string().datetime("Check-out time must be a valid datetime")
})

export const BreakSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  breakStart: z.string().datetime().optional(),
  breakEnd: z.string().datetime().optional()
})

// Validation helper functions
export function validateEmployeeId(employeeId: string): { valid: boolean; error?: string } {
  if (!employeeId) {
    return { valid: false, error: "Employee ID is required" }
  }
  
  if (employeeId.length < 4) {
    return { valid: false, error: "Employee ID must be at least 4 characters" }
  }
  
  if (!/^EMP\d{3,}$/.test(employeeId)) {
    return { valid: false, error: "Employee ID must start with EMP followed by 3+ digits" }
  }
  
  return { valid: true }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: "Password is required" }
  }
  
  if (password.length < 3) {
    return { valid: false, error: "Password must be at least 3 characters" }
  }
  
  return { valid: true }
}

export function validateTimeFormat(timeString: string): { valid: boolean; error?: string } {
  if (!timeString) {
    return { valid: false, error: "Time is required" }
  }
  
  const date = new Date(timeString)
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Invalid time format" }
  }
  
  return { valid: true }
}

export function validateDateRange(startDate: string, endDate: string): { valid: boolean; error?: string } {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: "Invalid date format" }
  }
  
  if (start > end) {
    return { valid: false, error: "Start date cannot be after end date" }
  }
  
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays > 365) {
    return { valid: false, error: "Date range cannot exceed 365 days" }
  }
  
  return { valid: true }
}

// Sanitization functions
export function sanitizeEmployeeId(employeeId: string): string {
  return employeeId.trim().toUpperCase()
}

export function sanitizePassword(password: string): string {
  return password.trim()
}

export function sanitizeTimeString(timeString: string): string {
  return new Date(timeString).toISOString()
}

// Data integrity checks
export function validateClockSequence(clockIn: string | null, clockOut: string | null, breakStart: string | null, breakEnd: string | null): { valid: boolean; error?: string } {
  if (!clockIn) {
    return { valid: true } // No clock in yet
  }
  
  const clockInTime = new Date(clockIn)
  
  if (clockOut) {
    const clockOutTime = new Date(clockOut)
    if (clockOutTime <= clockInTime) {
      return { valid: false, error: "Clock out time must be after clock in time" }
    }
  }
  
  if (breakStart) {
    const breakStartTime = new Date(breakStart)
    if (breakStartTime < clockInTime) {
      return { valid: false, error: "Break start cannot be before clock in" }
    }
    
    if (clockOut && breakStartTime >= new Date(clockOut)) {
      return { valid: false, error: "Break start cannot be after or at clock out" }
    }
  }
  
  if (breakEnd && breakStart) {
    const breakStartTime = new Date(breakStart)
    const breakEndTime = new Date(breakEnd)
    if (breakEndTime <= breakStartTime) {
      return { valid: false, error: "Break end must be after break start" }
    }
  }
  
  return { valid: true }
}

// Rate limiting validation
export function validateRateLimit(lastAction: string | null, actionType: 'clock_in' | 'clock_out' | 'break_start' | 'break_end'): { valid: boolean; error?: string } {
  if (!lastAction) {
    return { valid: true }
  }
  
  const lastActionTime = new Date(lastAction)
  const now = new Date()
  const timeDiff = now.getTime() - lastActionTime.getTime()
  
  // Minimum 1 second between actions
  if (timeDiff < 1000) {
    return { valid: false, error: "Please wait at least 1 second between actions" }
  }
  
  // Specific rate limits for different actions
  switch (actionType) {
    case 'clock_in':
      if (timeDiff < 5000) { // 5 seconds
        return { valid: false, error: "Please wait 5 seconds before clocking in again" }
      }
      break
    case 'clock_out':
      if (timeDiff < 5000) { // 5 seconds
        return { valid: false, error: "Please wait 5 seconds before clocking out again" }
      }
      break
    case 'break_start':
    case 'break_end':
      if (timeDiff < 2000) { // 2 seconds
        return { valid: false, error: "Please wait 2 seconds between break actions" }
      }
      break
  }
  
  return { valid: true }
}
