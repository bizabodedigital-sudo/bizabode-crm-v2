import mongoose, { Schema, Document } from "mongoose"

export interface IApproval extends Document {
  companyId: mongoose.Types.ObjectId
  type: "Quote" | "Discount" | "Credit" | "Return" | "Refund" | "Price" | "Order"
  relatedId: mongoose.Types.ObjectId
  relatedType: "Quote" | "Invoice" | "Order" | "Customer" | "Product"
  title: string
  description: string
  requestedBy: mongoose.Types.ObjectId
  requestedDate: Date
  amount?: number
  currency: string
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Pending" | "Approved" | "Rejected" | "Cancelled"
  approvers: {
    userId: mongoose.Types.ObjectId
    level: number
    status: "Pending" | "Approved" | "Rejected"
    approvedDate?: Date
    comments?: string
  }[]
  currentLevel: number
  totalLevels: number
  approvedBy?: mongoose.Types.ObjectId
  approvedDate?: Date
  rejectedBy?: mongoose.Types.ObjectId
  rejectedDate?: Date
  rejectionReason?: string
  comments?: string
  attachments?: string[]
  dueDate?: Date
  isOverdue: boolean
  createdAt: Date
  updatedAt: Date
}

const ApprovalSchema = new Schema<IApproval>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["Quote", "Discount", "Credit", "Return", "Refund", "Price", "Order"],
      required: true,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    relatedType: {
      type: String,
      enum: ["Quote", "Invoice", "Order", "Customer", "Product"],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requestedDate: {
      type: Date,
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
      index: true,
    },
    approvers: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      level: {
        type: Number,
        required: true,
        min: 1,
      },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
      },
      approvedDate: Date,
      comments: String,
    }],
    currentLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalLevels: {
      type: Number,
      required: true,
      min: 1,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedDate: Date,
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedDate: Date,
    rejectionReason: String,
    comments: String,
    attachments: [String],
    dueDate: Date,
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
ApprovalSchema.index({ companyId: 1, status: 1 })
ApprovalSchema.index({ companyId: 1, type: 1 })
ApprovalSchema.index({ companyId: 1, requestedBy: 1 })
ApprovalSchema.index({ companyId: 1, priority: 1 })
ApprovalSchema.index({ companyId: 1, dueDate: 1 })
ApprovalSchema.index({ companyId: 1, isOverdue: 1 })

// Pre-save middleware to check if overdue
ApprovalSchema.pre('save', function(next) {
  if (this.dueDate && this.status === 'Pending') {
    this.isOverdue = new Date() > this.dueDate
  }
  next()
})

export default mongoose.models.Approval || mongoose.model<IApproval>("Approval", ApprovalSchema)
