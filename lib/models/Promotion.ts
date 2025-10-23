import mongoose, { Schema, Document } from "mongoose"

export interface IPromotion extends Document {
  companyId: mongoose.Types.ObjectId
  name: string
  description: string
  type: "Percentage" | "Fixed Amount" | "Buy X Get Y" | "Volume Discount" | "Free Shipping"
  value: number
  minOrderValue?: number
  maxDiscount?: number
  applicableTo: "All Products" | "Specific Products" | "Product Categories" | "Customers"
  productIds?: mongoose.Types.ObjectId[]
  categoryIds?: mongoose.Types.ObjectId[]
  customerIds?: mongoose.Types.ObjectId[]
  startDate: Date
  endDate: Date
  isActive: boolean
  usageLimit?: number
  usageCount: number
  createdBy: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  approvedDate?: Date
  status: "Draft" | "Pending Approval" | "Active" | "Expired" | "Cancelled"
  conditions?: {
    minQuantity?: number
    maxQuantity?: number
    customerType?: string[]
    territory?: string[]
    paymentTerms?: string[]
  }
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const PromotionSchema = new Schema<IPromotion>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Percentage", "Fixed Amount", "Buy X Get Y", "Volume Discount", "Free Shipping"],
      required: true,
      index: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    applicableTo: {
      type: String,
      enum: ["All Products", "Specific Products", "Product Categories", "Customers"],
      required: true,
      index: true,
    },
    productIds: [Schema.Types.ObjectId],
    categoryIds: [Schema.Types.ObjectId],
    customerIds: [Schema.Types.ObjectId],
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedDate: Date,
    status: {
      type: String,
      enum: ["Draft", "Pending Approval", "Active", "Expired", "Cancelled"],
      default: "Draft",
      index: true,
    },
    conditions: {
      minQuantity: Number,
      maxQuantity: Number,
      customerType: [String],
      territory: [String],
      paymentTerms: [String],
    },
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
PromotionSchema.index({ companyId: 1, isActive: 1, startDate: 1, endDate: 1 })
PromotionSchema.index({ companyId: 1, status: 1 })
PromotionSchema.index({ companyId: 1, type: 1 })
PromotionSchema.index({ companyId: 1, applicableTo: 1 })

// Pre-save middleware to update status based on dates
PromotionSchema.pre('save', function(next) {
  const now = new Date()
  if (this.endDate < now && this.status === 'Active') {
    this.status = 'Expired'
    this.isActive = false
  } else if (this.startDate <= now && this.endDate >= now && this.status === 'Pending Approval') {
    this.status = 'Active'
  }
  next()
})

export default mongoose.models.Promotion || mongoose.model<IPromotion>("Promotion", PromotionSchema)
