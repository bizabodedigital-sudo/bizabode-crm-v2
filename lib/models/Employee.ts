import mongoose, { Schema, Document } from "mongoose"

export interface IEmployee extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: string // Company-specific employee ID
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  position: string
  department: string
  managerId?: mongoose.Types.ObjectId
  hireDate: Date
  salary: number
  hourlyRate?: number
  employmentType: 'full-time' | 'part-time' | 'contract' | 'intern'
  status: 'active' | 'inactive' | 'terminated' | 'on-leave'
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  documents: Array<{
    type: 'contract' | 'id' | 'certificate' | 'other'
    name: string
    url: string
    uploadedAt: Date
  }>
  notes?: string
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'US' }
}, { _id: false })

const EmergencyContactSchema = new Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String }
}, { _id: false })

const DocumentSchema = new Schema({
  type: {
    type: String,
    enum: ['contract', 'id', 'certificate', 'other'],
    required: true
  },
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false })

const EmployeeSchema = new Schema<IEmployee>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: AddressSchema,
    position: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
    hireDate: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'terminated', 'on-leave'],
      default: 'active',
      index: true,
    },
    emergencyContact: EmergencyContactSchema,
    documents: [DocumentSchema],
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for unique employee ID per company
EmployeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true })

// Index for department queries
EmployeeSchema.index({ companyId: 1, department: 1 })

// Index for status queries
EmployeeSchema.index({ companyId: 1, status: 1 })

// Index for manager relationships
EmployeeSchema.index({ companyId: 1, managerId: 1 })

export default mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema)
