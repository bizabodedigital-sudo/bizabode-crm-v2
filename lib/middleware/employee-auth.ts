import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import Employee from "@/lib/models/Employee"
import connectDB from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface AuthenticatedEmployeeRequest extends NextRequest {
  employee?: any
  employeeId?: string
  companyId?: string
}

export async function authenticateEmployeeToken(request: NextRequest): Promise<{
  authenticated: boolean
  user?: any
  error?: string
}> {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

    if (!token) {
      return { authenticated: false, error: "No token provided" }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    await connectDB()
    const employee = await Employee.findById(decoded.employeeId)

    if (!employee) {
      return { authenticated: false, error: "Employee not found" }
    }

    if (employee.status !== 'active') {
      return { authenticated: false, error: "Employee account is inactive" }
    }

    return {
      authenticated: true,
      user: {
        id: employee._id.toString(),
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        role: 'employee',
        companyId: employee.companyId?.toString() || '',
      },
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { authenticated: false, error: "Invalid token" }
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { authenticated: false, error: "Token expired" }
    }
    return { authenticated: false, error: "Authentication failed" }
  }
}

export function generateEmployeeToken(employeeId: string, companyId: string): string {
  return jwt.sign({ employeeId, companyId, role: 'employee' }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  })
}
