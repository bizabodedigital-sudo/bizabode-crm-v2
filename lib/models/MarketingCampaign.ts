import mongoose, { Schema, Document } from "mongoose"

export interface IMarketingCampaign extends Document {
  companyId: mongoose.Types.ObjectId
  name: string
  description: string
  type: "Email" | "WhatsApp" | "SMS" | "Direct Mail" | "Social Media" | "Other"
  status: "Draft" | "Scheduled" | "Active" | "Paused" | "Completed" | "Cancelled"
  startDate: Date
  endDate: Date
  budget?: number
  currency: string
  targetAudience: {
    segments: string[]
    criteria: {
      customerType?: string[]
      territory?: string[]
      lastOrderDate?: {
        from?: Date
        to?: Date
      }
      orderValue?: {
        min?: number
        max?: number
      }
      tags?: string[]
    }
  }
  content: {
    subject?: string
    message: string
    templateId?: mongoose.Types.ObjectId
    attachments?: string[]
  }
  delivery: {
    method: "Immediate" | "Scheduled" | "Drip"
    schedule?: Date
    frequency?: "Once" | "Daily" | "Weekly" | "Monthly"
    intervals?: number[]
  }
  metrics: {
    totalSent: number
    delivered: number
    opened: number
    clicked: number
    replied: number
    unsubscribed: number
    bounced: number
    conversionRate: number
    revenue: number
  }
  goals: {
    targetReach: number
    targetOpenRate: number
    targetClickRate: number
    targetConversionRate: number
    targetRevenue: number
  }
  createdBy: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  approvedDate?: Date
  isActive: boolean
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const MarketingCampaignSchema = new Schema<IMarketingCampaign>(
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
      enum: ["Email", "WhatsApp", "SMS", "Direct Mail", "Social Media", "Other"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "Active", "Paused", "Completed", "Cancelled"],
      default: "Draft",
      index: true,
    },
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
    budget: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    targetAudience: {
      segments: [String],
      criteria: {
        customerType: [String],
        territory: [String],
        lastOrderDate: {
          from: Date,
          to: Date,
        },
        orderValue: {
          min: Number,
          max: Number,
        },
        tags: [String],
      },
    },
    content: {
      subject: String,
      message: {
        type: String,
        required: true,
      },
      templateId: {
        type: Schema.Types.ObjectId,
        ref: "CommunicationTemplate",
      },
      attachments: [String],
    },
    delivery: {
      method: {
        type: String,
        enum: ["Immediate", "Scheduled", "Drip"],
        default: "Immediate",
      },
      schedule: Date,
      frequency: {
        type: String,
        enum: ["Once", "Daily", "Weekly", "Monthly"],
        default: "Once",
      },
      intervals: [Number],
    },
    metrics: {
      totalSent: {
        type: Number,
        default: 0,
        min: 0,
      },
      delivered: {
        type: Number,
        default: 0,
        min: 0,
      },
      opened: {
        type: Number,
        default: 0,
        min: 0,
      },
      clicked: {
        type: Number,
        default: 0,
        min: 0,
      },
      replied: {
        type: Number,
        default: 0,
        min: 0,
      },
      unsubscribed: {
        type: Number,
        default: 0,
        min: 0,
      },
      bounced: {
        type: Number,
        default: 0,
        min: 0,
      },
      conversionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      revenue: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    goals: {
      targetReach: {
        type: Number,
        min: 0,
      },
      targetOpenRate: {
        type: Number,
        min: 0,
        max: 100,
      },
      targetClickRate: {
        type: Number,
        min: 0,
        max: 100,
      },
      targetConversionRate: {
        type: Number,
        min: 0,
        max: 100,
      },
      targetRevenue: {
        type: Number,
        min: 0,
      },
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: [String],
    notes: String,
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
MarketingCampaignSchema.index({ companyId: 1, status: 1 })
MarketingCampaignSchema.index({ companyId: 1, type: 1 })
MarketingCampaignSchema.index({ companyId: 1, startDate: 1, endDate: 1 })
MarketingCampaignSchema.index({ companyId: 1, isActive: 1 })
MarketingCampaignSchema.index({ companyId: 1, createdBy: 1 })

// Pre-save middleware to calculate conversion rate
MarketingCampaignSchema.pre('save', function(next) {
  if (this.metrics.delivered > 0) {
    this.metrics.conversionRate = (this.metrics.clicked / this.metrics.delivered) * 100
  }
  next()
})

export default mongoose.models.MarketingCampaign || mongoose.model<IMarketingCampaign>("MarketingCampaign", MarketingCampaignSchema)
