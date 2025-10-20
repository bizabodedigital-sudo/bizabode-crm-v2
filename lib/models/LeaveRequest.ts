import mongoose, { Schema, Document } from "mongoose"

export interface ILeaveRequest extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  leaveType: 'vacation' | 'sick' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other'
  startDate: Date
  endDate: Date
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  requestedBy: mongoose.Types.ObjectId
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  rejectionReason?: string
  attachments?: Array<{
    name: string
    url: string
    uploadedAt: Date
  }>
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const AttachmentSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false })

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ['vacation', 'sick', 'personal', 'maternity', 'paternity', 'bereavement', 'other'],
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    attachments: [AttachmentSchema],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Index for employee leave requests
LeaveRequestSchema.index({ companyId: 1, employeeId: 1, startDate: -1 })

// Index for date range queries
LeaveRequestSchema.index({ companyId: 1, startDate: 1, endDate: 1 })

// Index for status queries
LeaveRequestSchema.index({ companyId: 1, status: 1 })

// Index for leave type queries
LeaveRequestSchema.index({ companyId: 1, leaveType: 1 })

export default mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema)
