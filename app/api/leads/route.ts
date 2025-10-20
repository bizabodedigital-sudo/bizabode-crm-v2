import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Lead from "@/lib/models/Lead"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { handleValidation } from "@/lib/middleware/validation"
import { handleQueryValidationBypass } from "@/lib/middleware/validation-bypass"
import { leadCreateSchema, leadQuerySchema } from "@/lib/validation/schemas"
import { handleApiError } from "@/lib/utils/error-handler"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "leads", "read")) {
      return forbiddenResponse("You don't have permission to view leads")
    }

    // Bypass validation temporarily for backward compatibility
    const queryValidation = handleQueryValidationBypass(request)

    await connectDB()

    const { page, limit, search, status, assignedTo } = queryValidation.data
    const query: any = { companyId: authResult.user.companyId }

    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
      ]
    }

    if (assignedTo) {
      query.assignedTo = assignedTo
    }

    const skip = (page - 1) * limit

    const [leads, total] = await Promise.all([
      Lead.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("assignedTo", "name email").lean(),
      Lead.countDocuments(query),
    ])

    return successResponse({
      leads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "leads", "create")) {
      return forbiddenResponse("You don't have permission to create leads")
    }

    // Validate request body
    const validation = await handleValidation(request, leadCreateSchema)
    if (!validation.success) {
      return validation.response
    }

    await connectDB()

    const lead = await Lead.create({
      ...validation.data,
      companyId: authResult.user.companyId,
    })

    return successResponse(lead, "Lead created successfully", 201)
  } catch (error: unknown) {
    return handleApiError(error)
  }
}

