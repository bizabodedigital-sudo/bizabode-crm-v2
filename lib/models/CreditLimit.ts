import mongoose, { Schema, Document } from "mongoose"

export interface ICreditLimit extends Document {
  companyId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  creditLimit: number
  currentBalance: number
  creditUsed: number
  creditAvailable: number
  paymentTerms: "COD" | "Net 15" | "Net 30" | "Net 60" | "Prepaid" | "Credit"
  creditHold: boolean
  creditHoldReason?: string
  creditHoldDate?: Date
  lastPaymentDate?: Date
  lastPaymentAmount?: number
  averagePaymentDays?: number
  creditScore?: number
  riskLevel: "Low" | "Medium" | "High" | "Critical"
  approvedBy?: mongoose.Types.ObjectId
  approvedDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const CreditLimitSchema = new Schema<ICreditLimit>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },
    creditLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    currentBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    creditAvailable: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentTerms: {
      type: String,
      enum: ["COD", "Net 15", "Net 30", "Net 60", "Prepaid", "Credit"],
      required: true,
      index: true,
    },
    creditHold: {
      type: Boolean,
      default: false,
      index: true,
    },
    creditHoldReason: String,
    creditHoldDate: Date,
    lastPaymentDate: Date,
    lastPaymentAmount: {
      type: Number,
      min: 0,
    },
    averagePaymentDays: {
      type: Number,
      min: 0,
    },
    creditScore: {
      type: Number,
      min: 0,
      max: 1000,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
      index: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedDate: Date,
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
CreditLimitSchema.index({ companyId: 1, customerId: 1 }, { unique: true })
CreditLimitSchema.index({ companyId: 1, riskLevel: 1 })
CreditLimitSchema.index({ companyId: 1, creditHold: 1 })
CreditLimitSchema.index({ companyId: 1, creditAvailable: 1 })

// Pre-save middleware to calculate credit available
CreditLimitSchema.pre('save', function(next) {
  this.creditAvailable = this.creditLimit - this.creditUsed
  next()
})

export default mongoose.models.CreditLimit || mongoose.model<ICreditLimit>("CreditLimit", CreditLimitSchema)
