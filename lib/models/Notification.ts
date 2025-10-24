import mongoose, { Schema, Document } from "mongoose"

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  companyId: mongoose.Types.ObjectId
  title: string
  message: string
  type: "task_reminder" | "task_created" | "task_overdue" | "customer_reengagement" | "customer_contact" | "customer_high_risk" | "overdue_invoices" | "new_lead" | "quote_converted" | "order_delivered" | "daily_digest" | "weekly_digest" | "general"
  isRead: boolean
  readAt?: Date
  data?: Record<string, any> // Additional data for the notification
  // Related entities
  relatedTaskId?: mongoose.Types.ObjectId
  relatedActivityId?: mongoose.Types.ObjectId
  relatedLeadId?: mongoose.Types.ObjectId
  relatedOpportunityId?: mongoose.Types.ObjectId
  relatedCustomerId?: mongoose.Types.ObjectId
  relatedOrderId?: mongoose.Types.ObjectId
  relatedInvoiceId?: mongoose.Types.ObjectId
  relatedQuoteId?: mongoose.Types.ObjectId
  // Priority and expiration
  priority: "Low" | "Medium" | "High" | "Urgent"
  expiresAt?: Date
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "task_reminder",
        "task_created", 
        "task_overdue",
        "customer_reengagement",
        "customer_contact",
        "customer_high_risk",
        "overdue_invoices",
        "new_lead",
        "quote_converted",
        "order_delivered",
        "daily_digest",
        "weekly_digest",
        "general"
      ],
      required: true,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    // Related entities
    relatedTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      index: true,
    },
    relatedActivityId: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      index: true,
    },
    relatedLeadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
    },
    relatedOpportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      index: true,
    },
    relatedCustomerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },
    relatedOrderId: {
      type: Schema.Types.ObjectId,
      ref: "SalesOrder",
      index: true,
    },
    relatedInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      index: true,
    },
    relatedQuoteId: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1 })
NotificationSchema.index({ companyId: 1, type: 1 })
NotificationSchema.index({ createdAt: -1 })
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for auto-deletion

// Pre-save middleware to set readAt when isRead changes
NotificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date()
  }
  next()
})

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema)
