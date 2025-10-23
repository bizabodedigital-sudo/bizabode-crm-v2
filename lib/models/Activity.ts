import mongoose, { Schema, Document } from "mongoose"

export interface IActivity extends Document {
  companyId: mongoose.Types.ObjectId
  leadId?: mongoose.Types.ObjectId
  opportunityId?: mongoose.Types.ObjectId
  customerId?: mongoose.Types.ObjectId
  type: "Call" | "Visit" | "Meeting" | "Email" | "WhatsApp" | "Task" | "Note"
  subject: string
  description: string
  duration?: number // in minutes
  outcome?: "Positive" | "Neutral" | "Negative" | "No Response" | "Follow-up Required"
  scheduledDate?: Date
  completedDate?: Date
  assignedTo: mongoose.Types.ObjectId
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled"
  priority?: "Low" | "Medium" | "High" | "Urgent"
  location?: string
  attachments?: string[] // URLs to attached files
  relatedQuoteId?: mongoose.Types.ObjectId
  relatedOrderId?: mongoose.Types.ObjectId
  relatedInvoiceId?: mongoose.Types.ObjectId
  nextFollowUpDate?: Date
  createdAt: Date
  updatedAt: Date
}

const ActivitySchema = new Schema<IActivity>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },
    type: {
      type: String,
      enum: ["Call", "Visit", "Meeting", "Email", "WhatsApp", "Task", "Note"],
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      min: 0,
    },
    outcome: {
      type: String,
      enum: ["Positive", "Neutral", "Negative", "No Response", "Follow-up Required"],
    },
    scheduledDate: {
      type: Date,
      index: true,
    },
    completedDate: {
      type: Date,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Scheduled", "In Progress", "Completed", "Cancelled"],
      default: "Scheduled",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
    },
    location: {
      type: String,
    },
    attachments: [String],
    relatedQuoteId: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
    },
    relatedOrderId: {
      type: Schema.Types.ObjectId,
      ref: "SalesOrder",
    },
    relatedInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    nextFollowUpDate: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
ActivitySchema.index({ companyId: 1, leadId: 1, type: 1 })
ActivitySchema.index({ companyId: 1, opportunityId: 1, type: 1 })
ActivitySchema.index({ companyId: 1, customerId: 1, type: 1 })
ActivitySchema.index({ companyId: 1, assignedTo: 1, status: 1 })
ActivitySchema.index({ companyId: 1, scheduledDate: 1, status: 1 })

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema)
