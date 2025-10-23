import mongoose, { Schema, Document } from "mongoose"

export interface IDocument extends Document {
  companyId: mongoose.Types.ObjectId
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  category: "Quote" | "Invoice" | "Delivery" | "Payment" | "Contract" | "Other"
  relatedTo: "Lead" | "Opportunity" | "Customer" | "Quote" | "Order" | "Invoice" | "Activity" | "General"
  relatedId?: mongoose.Types.ObjectId
  uploadedBy: mongoose.Types.ObjectId
  description?: string
  tags?: string[]
  isPublic: boolean
  accessLevel: "Private" | "Internal" | "Customer" | "Public"
  version: number
  parentDocumentId?: mongoose.Types.ObjectId
  isActive: boolean
  downloadCount: number
  lastAccessed?: Date
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const DocumentSchema = new Schema<IDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    mimeType: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Quote", "Invoice", "Delivery", "Payment", "Contract", "Other"],
      required: true,
      index: true,
    },
    relatedTo: {
      type: String,
      enum: ["Lead", "Opportunity", "Customer", "Quote", "Order", "Invoice", "Activity", "General"],
      required: true,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: String,
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
    accessLevel: {
      type: String,
      enum: ["Private", "Internal", "Customer", "Public"],
      default: "Internal",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    parentDocumentId: {
      type: Schema.Types.ObjectId,
      ref: "Document",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAccessed: Date,
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
DocumentSchema.index({ companyId: 1, relatedTo: 1, relatedId: 1 })
DocumentSchema.index({ companyId: 1, category: 1 })
DocumentSchema.index({ companyId: 1, uploadedBy: 1 })
DocumentSchema.index({ companyId: 1, isActive: 1 })
DocumentSchema.index({ companyId: 1, accessLevel: 1 })
DocumentSchema.index({ companyId: 1, expiresAt: 1 })

// Pre-save middleware to handle file expiration
DocumentSchema.pre('save', function(next) {
  if (this.isModified('expiresAt') && this.expiresAt && this.expiresAt < new Date()) {
    this.isActive = false
  }
  next()
})

export default mongoose.models.Document || mongoose.model<IDocument>("Document", DocumentSchema)
