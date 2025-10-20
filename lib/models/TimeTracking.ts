import mongoose, { Schema, Document } from "mongoose"

export interface ITimeEntry extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  projectId?: mongoose.Types.ObjectId
  projectName?: string
  task: string
  description?: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  isBillable: boolean
  hourlyRate?: number
  totalAmount?: number
  status: 'active' | 'paused' | 'completed' | 'approved' | 'rejected'
  tags: string[]
  location?: string
  notes?: string
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  rejectedReason?: string
  createdAt: Date
  updatedAt: Date
}

export interface ITimeSheet extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  weekStartDate: Date
  weekEndDate: Date
  totalHours: number
  billableHours: number
  entries: mongoose.Types.ObjectId[]
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: Date
  approvedBy?: mongoose.Types.ObjectId
  approvedAt?: Date
  rejectedReason?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const TimeEntrySchema = new Schema<ITimeEntry>(
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
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
    projectName: {
      type: String,
    },
    task: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    isBillable: {
      type: Boolean,
      default: false,
    },
    hourlyRate: {
      type: Number,
      min: 0,
    },
    totalAmount: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'approved', 'rejected'],
      default: 'active',
      index: true,
    },
    tags: [String],
    location: {
      type: String,
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
    rejectedReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

const TimeSheetSchema = new Schema<ITimeSheet>(
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
    weekStartDate: {
      type: Date,
      required: true,
      index: true,
    },
    weekEndDate: {
      type: Date,
      required: true,
    },
    totalHours: {
      type: Number,
      required: true,
      min: 0,
    },
    billableHours: {
      type: Number,
      required: true,
      min: 0,
    },
    entries: [{
      type: Schema.Types.ObjectId,
      ref: "TimeEntry",
    }],
    status: {
      type: String,
      enum: ['draft', 'submitted', 'approved', 'rejected'],
      default: 'draft',
      index: true,
    },
    submittedAt: {
      type: Date,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    rejectedReason: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for TimeEntry
TimeEntrySchema.index({ companyId: 1, employeeId: 1, startTime: -1 })
TimeEntrySchema.index({ companyId: 1, projectId: 1, startTime: -1 })
TimeEntrySchema.index({ companyId: 1, status: 1, startTime: -1 })
TimeEntrySchema.index({ companyId: 1, isBillable: 1, startTime: -1 })

// Indexes for TimeSheet
TimeSheetSchema.index({ companyId: 1, employeeId: 1, weekStartDate: -1 })
TimeSheetSchema.index({ companyId: 1, status: 1, weekStartDate: -1 })

// Compound index for unique timesheet per employee per week
TimeSheetSchema.index({ companyId: 1, employeeId: 1, weekStartDate: 1 }, { unique: true })

export const TimeEntry = mongoose.models.TimeEntry || mongoose.model<ITimeEntry>("TimeEntry", TimeEntrySchema)
export const TimeSheet = mongoose.models.TimeSheet || mongoose.model<ITimeSheet>("TimeSheet", TimeSheetSchema)
