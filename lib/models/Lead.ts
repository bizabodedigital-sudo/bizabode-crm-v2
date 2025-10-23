import mongoose, { Schema, Document } from "mongoose"

export interface ILead extends Document {
  companyId: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: "new" | "contacted" | "qualified" | "unqualified"
  notes: string
  assignedTo?: mongoose.Types.ObjectId
  tags?: string[]
  customFields?: Record<string, any>
  // Enhanced fields for Icon Trading workflow
  category?: "Hotel" | "Supermarket" | "Restaurant" | "Contractor" | "Other"
  productInterest?: string[]
  monthlyVolume?: number
  territory?: string
  leadScore?: number
  customerType?: "Volume Buyer" | "Commercial" | "Retail" | "Wholesale" | "Other"
  createdAt: Date
  updatedAt: Date
}

const LeadSchema = new Schema<ILead>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "unqualified"],
      default: "new",
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    tags: [String],
    customFields: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    // Enhanced fields for Icon Trading workflow
    category: {
      type: String,
      enum: ["Hotel", "Supermarket", "Restaurant", "Contractor", "Other"],
      index: true,
    },
    productInterest: [String],
    monthlyVolume: {
      type: Number,
      min: 0,
    },
    territory: {
      type: String,
      index: true,
    },
    leadScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    customerType: {
      type: String,
      enum: ["Volume Buyer", "Commercial", "Retail", "Wholesale", "Other"],
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema)

