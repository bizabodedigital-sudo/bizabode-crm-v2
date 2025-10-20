import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import LeaveRequest from "@/lib/models/LeaveRequest"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "leave", "read")) {
      return forbiddenResponse("You don't have permission to view leave requests")
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const status = searchParams.get("status") || ""
    const employeeId = searchParams.get("employeeId") || ""

    const query: any = { companyId: authResult.user.companyId }

    if (status) {
      query.status = status
    }

    if (employeeId) {
      query.employeeId = employeeId
    }

    const skip = (page - 1) * limit

    const [result, total] = await Promise.all([
      LeaveRequest.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("employeeId", "firstName lastName email position")
        .populate("approvedBy", "firstName lastName email")
        .lean(),
      LeaveRequest.countDocuments(query),
    ])

    return successResponse({
      leaveRequests: result,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("Get leave requests error:", error)
    return errorResponse(error.message || "Failed to get leave requests", 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "leave", "create")) {
      return forbiddenResponse("You don't have permission to create leave requests")
    }

    await connectDB()

    const body = await request.json()

    const leaveRequest = await LeaveRequest.create({
      ...body,
      companyId: authResult.user.companyId,
      employeeId: authResult.user.id, // Default to current user if not specified
    })

    return successResponse(leaveRequest, "Leave request created successfully", 201)
  } catch (error: any) {
    console.error("Create leave request error:", error)
    return errorResponse(error.message || "Failed to create leave request", 500)
  }
}
