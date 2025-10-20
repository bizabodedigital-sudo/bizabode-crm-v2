import mongoose, { Schema, Document } from "mongoose"

export interface IAttendance extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  date: Date
  checkIn?: Date
  checkOut?: Date
  breakStart?: Date
  breakEnd?: Date
  totalHours: number
  overtimeHours: number
  status: 'present' | 'absent' | 'late' | 'half-day' | 'sick' | 'vacation' | 'holiday'
  notes?: string
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema = new Schema<IAttendance>(
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
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    breakStart: {
      type: Date,
    },
    breakEnd: {
      type: Date,
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'sick', 'vacation', 'holiday'],
      required: true,
      index: true,
    },
    notes: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for unique attendance per employee per day
AttendanceSchema.index({ companyId: 1, employeeId: 1, date: 1 }, { unique: true })

// Index for date range queries
AttendanceSchema.index({ companyId: 1, date: 1 })

// Index for employee attendance history
AttendanceSchema.index({ companyId: 1, employeeId: 1, date: -1 })

// Index for status queries
AttendanceSchema.index({ companyId: 1, status: 1, date: 1 })

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema)
