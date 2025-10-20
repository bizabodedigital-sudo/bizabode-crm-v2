import mongoose, { Schema, Document } from "mongoose"

export interface ICompany extends Document {
  name: string
  licenseKey: string
  licensePlan: "trial" | "basic" | "professional" | "enterprise"
  licenseExpiry: Date
  licenseStatus: "active" | "expired" | "suspended"
  logo?: string
  address?: string
  phone?: string
  email?: string
  website?: string
  settings: {
    currency: string
    taxRate: number
    timezone: string
  }
  createdAt: Date
  updatedAt: Date
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    licenseKey: {
      type: String,
      required: [true, "License key is required"],
      unique: true,
      trim: true,
    },
    licensePlan: {
      type: String,
      enum: ["trial", "basic", "professional", "enterprise"],
      default: "trial",
    },
    licenseExpiry: {
      type: Date,
      required: true,
    },
    licenseStatus: {
      type: String,
      enum: ["active", "expired", "suspended"],
      default: "active",
    },
    logo: {
      type: String,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
      type: String,
    },
    settings: {
      currency: {
        type: String,
        default: "USD",
      },
      taxRate: {
        type: Number,
        default: 10,
      },
      timezone: {
        type: String,
        default: "UTC",
      },
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema)

