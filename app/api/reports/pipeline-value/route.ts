import { NextRequest } from "next/server"
import connectDB from "@/lib/db"
import Opportunity from "@/lib/models/Opportunity"
import { authenticateToken } from "@/lib/middleware/auth"
import { checkPermission } from "@/lib/middleware/rbac"
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request)
    if (!authResult.authenticated) {
      return unauthorizedResponse(authResult.error)
    }

    if (!checkPermission(authResult.user, "reports", "read")) {
      return forbiddenResponse("You don't have permission to view reports")
    }

    await connectDB()

    const companyId = authResult.user.companyId

    // Get pipeline value by stage
    const pipelineByStage = await Opportunity.aggregate([
      {
        $match: {
          companyId: authResult.user.companyId,
          stage: { $nin: ["closed-won", "closed-lost"] },
        },
      },
      {
        $group: {
          _id: "$stage",
          totalValue: { $sum: "$value" },
          count: { $sum: 1 },
          weightedValue: { $sum: { $multiply: ["$value", { $divide: ["$probability", 100] }] } },
        },
      },
      {
        $sort: { totalValue: -1 },
      },
    ])

    // Total pipeline value
    const totalPipeline = pipelineByStage.reduce((sum, stage) => sum + stage.totalValue, 0)
    const totalWeightedPipeline = pipelineByStage.reduce((sum, stage) => sum + stage.weightedValue, 0)

    // Won opportunities
    const wonStats = await Opportunity.aggregate([
      {
        $match: {
          companyId: authResult.user.companyId,
          stage: "closed-won",
        },
      },
      {
        $group: {
          _id: null,
          totalValue: { $sum: "$value" },
          count: { $sum: 1 },
        },
      },
    ])

    return successResponse({
      totalPipeline,
      totalWeightedPipeline,
      pipelineByStage: pipelineByStage.map((stage) => ({
        stage: stage._id,
        value: stage.totalValue,
        count: stage.count,
        weightedValue: stage.weightedValue,
      })),
      wonDeals: {
        value: wonStats.length > 0 ? wonStats[0].totalValue : 0,
        count: wonStats.length > 0 ? wonStats[0].count : 0,
      },
    })
  } catch (error: any) {
    console.error("Get pipeline value error:", error)
    return errorResponse(error.message || "Failed to get pipeline data", 500)
  }
}

