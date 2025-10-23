import mongoose, { Schema, Document } from "mongoose";

export interface ILeaveRequest extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveType: 'sick' | 'vacation' | 'personal' | 'maternity' | 'paternity' | 'bereavement' | 'other';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  companyId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  leaveType: {
    type: String,
    enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'bereavement', 'other'],
    required: true,
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
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true,
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
    maxlength: 500,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
LeaveRequestSchema.index({ companyId: 1, status: 1 });
LeaveRequestSchema.index({ employeeId: 1, startDate: 1 });
LeaveRequestSchema.index({ companyId: 1, leaveType: 1 });

const LeaveRequest = mongoose.models.LeaveRequest || mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);

export { LeaveRequest };
export default LeaveRequest;