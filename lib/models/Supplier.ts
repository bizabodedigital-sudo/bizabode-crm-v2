import mongoose, { Schema, Document, Types } from "mongoose"

export interface ISupplier extends Document {
  companyId: Types.ObjectId
  name: string
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contactPerson?: string
  taxId?: string
  paymentTerms?: string
  notes?: string
  isActive: boolean
  createdBy: Types.ObjectId
  updatedBy: Types.ObjectId
}

const SupplierSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zipCode: { type: String },
      country: { type: String, default: "US" },
    },
    contactPerson: { type: String },
    taxId: { type: String },
    paymentTerms: { type: String },
    notes: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

// Indexes for performance
SupplierSchema.index({ companyId: 1, name: 1 })
SupplierSchema.index({ companyId: 1, email: 1 })
SupplierSchema.index({ companyId: 1, isActive: 1 })

const Supplier = mongoose.models.Supplier || mongoose.model<ISupplier>("Supplier", SupplierSchema)

export default Supplier
