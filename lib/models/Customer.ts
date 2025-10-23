import mongoose, { Schema, Document } from "mongoose"

export interface ICustomer extends Document {
  companyId: mongoose.Types.ObjectId
  companyName: string
  contactPerson: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  category: "Hotel" | "Supermarket" | "Restaurant" | "Contractor" | "Other"
  customerType: "Volume Buyer" | "Commercial" | "Retail" | "Wholesale" | "Other"
  territory?: string
  assignedTo?: mongoose.Types.ObjectId
  // Payment & Credit
  paymentTerms: "COD" | "Net 15" | "Net 30" | "Net 60" | "Prepaid" | "Credit"
  creditLimit?: number
  currentBalance: number
  creditUsed: number
  creditAvailable: number
  // Status & Rating
  status: "Active" | "Inactive" | "Suspended" | "Prospect"
  rating?: number // 1-5 stars
  tags?: string[]
  notes?: string
  // Business Information
  businessType?: string
  industry?: string
  employeeCount?: number
  annualRevenue?: number
  website?: string
  // Purchase History & Statistics
  totalOrders: number
  totalValue: number
  averageOrderValue: number
  lastOrderDate?: Date
  lastContactDate?: Date
  // Preferences
  preferredContactMethod?: "Phone" | "Email" | "WhatsApp" | "SMS"
  preferredDeliveryTime?: string
  specialInstructions?: string
  // Timestamps
  firstOrderDate?: Date
  lastActivityDate?: Date
  createdAt: Date
  updatedAt: Date
}

const CustomerSchema = new Schema<ICustomer>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
    },
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: {
      type: String,
      default: "Jamaica",
    },
    category: {
      type: String,
      enum: ["Hotel", "Supermarket", "Restaurant", "Contractor", "Other"],
      required: true,
      index: true,
    },
    customerType: {
      type: String,
      enum: ["Volume Buyer", "Commercial", "Retail", "Wholesale", "Other"],
      required: true,
      index: true,
    },
    territory: {
      type: String,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    // Payment & Credit
    paymentTerms: {
      type: String,
      enum: ["COD", "Net 15", "Net 30", "Net 60", "Prepaid", "Credit"],
      default: "Net 30",
    },
    creditLimit: {
      type: Number,
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
    // Status & Rating
    status: {
      type: String,
      enum: ["Active", "Inactive", "Suspended", "Prospect"],
      default: "Prospect",
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    tags: [String],
    notes: String,
    // Business Information
    businessType: String,
    industry: String,
    employeeCount: Number,
    annualRevenue: Number,
    website: String,
    // Purchase History & Statistics
    totalOrders: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastOrderDate: Date,
    lastContactDate: Date,
    // Preferences
    preferredContactMethod: {
      type: String,
      enum: ["Phone", "Email", "WhatsApp", "SMS"],
    },
    preferredDeliveryTime: String,
    specialInstructions: String,
    // Timestamps
    firstOrderDate: Date,
    lastActivityDate: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
CustomerSchema.index({ companyId: 1, status: 1 })
CustomerSchema.index({ companyId: 1, category: 1 })
CustomerSchema.index({ companyId: 1, territory: 1 })
CustomerSchema.index({ companyId: 1, assignedTo: 1 })
CustomerSchema.index({ companyId: 1, customerType: 1 })
CustomerSchema.index({ companyId: 1, lastOrderDate: 1 })
CustomerSchema.index({ companyId: 1, lastContactDate: 1 })

// Pre-save middleware to calculate credit available
CustomerSchema.pre('save', function(next) {
  if (this.creditLimit && this.creditUsed !== undefined) {
    this.creditAvailable = Math.max(0, this.creditLimit - this.creditUsed)
  }
  next()
})

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema)
