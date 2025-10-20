import mongoose, { Document, Schema } from 'mongoose'

export interface IFeedback extends Document {
  _id: string
  companyId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  orderNumber?: string
  invoiceNumber?: string
  deliveryId?: string
  type: 'complaint' | 'suggestion' | 'compliment' | 'issue' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  subject: string
  description: string
  resolution?: string
  rating?: number // 1-5 stars
  attachments?: string[] // File URLs
  assignedTo?: string // User ID
  createdBy?: string // User ID (if created internally)
  resolvedBy?: string // User ID
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>({
  companyId: {
    type: String,
    required: true,
    ref: 'Company'
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String
  },
  orderNumber: {
    type: String
  },
  invoiceNumber: {
    type: String
  },
  deliveryId: {
    type: String,
    ref: 'Delivery'
  },
  type: {
    type: String,
    enum: ['complaint', 'suggestion', 'compliment', 'issue', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  resolution: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  attachments: [{
    type: String
  }],
  assignedTo: {
    type: String,
    ref: 'User'
  },
  createdBy: {
    type: String,
    ref: 'User'
  },
  resolvedBy: {
    type: String,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
})

// Indexes for performance
FeedbackSchema.index({ companyId: 1, status: 1 })
FeedbackSchema.index({ companyId: 1, type: 1 })
FeedbackSchema.index({ companyId: 1, priority: 1 })
FeedbackSchema.index({ companyId: 1, assignedTo: 1 })
FeedbackSchema.index({ companyId: 1, createdAt: -1 })

export const Feedback = mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)
