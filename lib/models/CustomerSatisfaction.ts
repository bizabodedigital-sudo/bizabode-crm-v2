import mongoose, { Schema, Document } from "mongoose"

export interface ICustomerSatisfaction extends Document {
  companyId: mongoose.Types.ObjectId
  customerId: mongoose.Types.ObjectId
  orderId?: mongoose.Types.ObjectId
  invoiceId?: mongoose.Types.ObjectId
  rating: number // 1-5 stars
  feedback?: string
  categories: {
    productQuality: number
    deliveryTime: number
    customerService: number
    pricing: number
    overallExperience: number
  }
  npsScore?: number // Net Promoter Score (-100 to 100)
  wouldRecommend: boolean
  issues?: string[]
  improvements?: string[]
  contactMethod: "Email" | "Phone" | "WhatsApp" | "SMS" | "In-Person"
  responseDate: Date
  followUpRequired: boolean
  followUpDate?: Date
  followUpNotes?: string
  resolved: boolean
  resolvedDate?: Date
  resolvedBy?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CustomerSatisfactionSchema = new Schema<ICustomerSatisfaction>(
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
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "SalesOrder",
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    feedback: String,
    categories: {
      productQuality: {
        type: Number,
        min: 1,
        max: 5,
      },
      deliveryTime: {
        type: Number,
        min: 1,
        max: 5,
      },
      customerService: {
        type: Number,
        min: 1,
        max: 5,
      },
      pricing: {
        type: Number,
        min: 1,
        max: 5,
      },
      overallExperience: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    npsScore: {
      type: Number,
      min: -100,
      max: 100,
    },
    wouldRecommend: {
      type: Boolean,
      required: true,
      index: true,
    },
    issues: [String],
    improvements: [String],
    contactMethod: {
      type: String,
      enum: ["Email", "Phone", "WhatsApp", "SMS", "In-Person"],
      required: true,
    },
    responseDate: {
      type: Date,
      required: true,
      index: true,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
      index: true,
    },
    followUpDate: Date,
    followUpNotes: String,
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedDate: Date,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
CustomerSatisfactionSchema.index({ companyId: 1, customerId: 1 })
CustomerSatisfactionSchema.index({ companyId: 1, rating: 1 })
CustomerSatisfactionSchema.index({ companyId: 1, followUpRequired: 1 })
CustomerSatisfactionSchema.index({ companyId: 1, resolved: 1 })
CustomerSatisfactionSchema.index({ companyId: 1, responseDate: 1 })

// Pre-save middleware to calculate NPS score
CustomerSatisfactionSchema.pre('save', function(next) {
  if (this.isModified('rating')) {
    // Simple NPS calculation: rating 4-5 = promoter (100), rating 3 = neutral (0), rating 1-2 = detractor (-100)
    if (this.rating >= 4) {
      this.npsScore = 100
    } else if (this.rating === 3) {
      this.npsScore = 0
    } else {
      this.npsScore = -100
    }
  }
  next()
})

export default mongoose.models.CustomerSatisfaction || mongoose.model<ICustomerSatisfaction>("CustomerSatisfaction", CustomerSatisfactionSchema)
