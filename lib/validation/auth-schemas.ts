import { z } from 'zod'

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password too long')
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name too long'),
  licenseKey: z.string().min(1, 'License key is required')
})

export const employeeLoginSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required').max(50, 'Employee ID too long'),
  password: z.string().min(1, 'Password is required').max(100, 'Password too long')
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type EmployeeLoginInput = z.infer<typeof employeeLoginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
