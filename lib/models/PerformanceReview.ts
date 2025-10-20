import mongoose, { Schema, Document } from "mongoose"

export interface IPerformanceScore {
  category: string
  score: number // 1-5 scale
  comments?: string
}

export interface IPerformanceReview extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  reviewPeriod: {
    startDate: Date
    endDate: Date
  }
  reviewType: 'annual' | 'quarterly' | 'probation' | 'project' | 'custom'
  scores: IPerformanceScore[]
  overallScore: number
  strengths: string[]
  areasForImprovement: string[]
  goals: string[]
  managerComments: string
  employeeComments?: string
  status: 'draft' | 'submitted' | 'under_review' | 'completed' | 'cancelled'
  reviewedBy: mongoose.Types.ObjectId
  employeeAcknowledged: boolean
  employeeAcknowledgedAt?: Date
  completedAt?: Date
  nextReviewDate?: Date
  createdAt: Date
  updatedAt: Date
}

const PerformanceScoreSchema = new Schema<IPerformanceScore>({
  category: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comments: {
    type: String,
  },
}, { _id: false })

const PerformanceReviewSchema = new Schema<IPerformanceReview>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    reviewPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    reviewType: {
      type: String,
      enum: ['annual', 'quarterly', 'probation', 'project', 'custom'],
      required: true,
      index: true,
    },
    scores: [PerformanceScoreSchema],
    overallScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    strengths: [String],
    areasForImprovement: [String],
    goals: [String],
    managerComments: {
      type: String,
      required: true,
    },
    employeeComments: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeAcknowledged: {
      type: Boolean,
      default: false,
    },
    employeeAcknowledgedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    nextReviewDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for unique review per employee per period
PerformanceReviewSchema.index({ companyId: 1, employeeId: 1, 'reviewPeriod.startDate': 1, 'reviewPeriod.endDate': 1 }, { unique: true })

// Index for review queries
PerformanceReviewSchema.index({ companyId: 1, reviewType: 1, status: 1 })

// Index for employee review history
PerformanceReviewSchema.index({ companyId: 1, employeeId: 1, createdAt: -1 })

export default mongoose.models.PerformanceReview || mongoose.model<IPerformanceReview>("PerformanceReview", PerformanceReviewSchema)
