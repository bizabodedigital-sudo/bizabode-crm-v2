import mongoose, { Schema, Document } from "mongoose"

export interface ICommunicationTemplate extends Document {
  companyId: mongoose.Types.ObjectId
  name: string
  description: string
  type: "Email" | "WhatsApp" | "SMS" | "Letter" | "Quote" | "Invoice"
  category: "Welcome" | "Follow-up" | "Reminder" | "Promotion" | "Order" | "Payment" | "Delivery" | "Other"
  subject?: string
  content: string
  variables: string[]
  isActive: boolean
  isDefault: boolean
  usageCount: number
  lastUsed?: Date
  createdBy: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  approvedDate?: Date
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected"
  tags: string[]
  attachments?: string[]
  language: string
  version: number
  parentTemplateId?: mongoose.Types.ObjectId
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

const CommunicationTemplateSchema = new Schema<ICommunicationTemplate>(
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
      enum: ["Email", "WhatsApp", "SMS", "Letter", "Quote", "Invoice"],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ["Welcome", "Follow-up", "Reminder", "Promotion", "Order", "Payment", "Delivery", "Other"],
      required: true,
      index: true,
    },
    subject: String,
    content: {
      type: String,
      required: true,
    },
    variables: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUsed: Date,
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
      enum: ["Draft", "Pending Approval", "Approved", "Rejected"],
      default: "Draft",
      index: true,
    },
    tags: [String],
    attachments: [String],
    language: {
      type: String,
      default: "en",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    parentTemplateId: {
      type: Schema.Types.ObjectId,
      ref: "CommunicationTemplate",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
CommunicationTemplateSchema.index({ companyId: 1, type: 1, category: 1 })
CommunicationTemplateSchema.index({ companyId: 1, isActive: 1 })
CommunicationTemplateSchema.index({ companyId: 1, status: 1 })
CommunicationTemplateSchema.index({ companyId: 1, isDefault: 1 })
CommunicationTemplateSchema.index({ companyId: 1, language: 1 })

export default mongoose.models.CommunicationTemplate || mongoose.model<ICommunicationTemplate>("CommunicationTemplate", CommunicationTemplateSchema)
