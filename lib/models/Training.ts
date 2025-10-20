import mongoose, { Schema, Document } from "mongoose"

export interface ITrainingRecord {
  trainingId: mongoose.Types.ObjectId
  completionDate: Date
  score?: number
  certificateUrl?: string
  expiryDate?: Date
  status: 'completed' | 'in_progress' | 'failed' | 'expired'
  notes?: string
}

export interface ITraining extends Document {
  companyId: mongoose.Types.ObjectId
  title: string
  description: string
  category: 'safety' | 'technical' | 'compliance' | 'soft_skills' | 'certification' | 'other'
  type: 'online' | 'classroom' | 'workshop' | 'seminar' | 'certification'
  duration: number // in hours
  isRequired: boolean
  targetRoles: string[]
  targetDepartments: string[]
  instructor?: string
  location?: string
  maxParticipants?: number
  cost?: number
  currency?: string
  prerequisites?: string[]
  learningObjectives: string[]
  materials?: Array<{
    name: string
    url: string
    type: 'document' | 'video' | 'link' | 'other'
  }>
  isActive: boolean
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export interface IEmployeeTraining extends Document {
  companyId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  trainingId: mongoose.Types.ObjectId
  assignedDate: Date
  dueDate?: Date
  completionDate?: Date
  score?: number
  certificateUrl?: string
  expiryDate?: Date
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'failed' | 'expired'
  notes?: string
  assignedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const MaterialSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['document', 'video', 'link', 'other'],
    required: true 
  }
}, { _id: false })

const TrainingSchema = new Schema<ITraining>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['safety', 'technical', 'compliance', 'soft_skills', 'certification', 'other'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['online', 'classroom', 'workshop', 'seminar', 'certification'],
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    targetRoles: [String],
    targetDepartments: [String],
    instructor: {
      type: String,
    },
    location: {
      type: String,
    },
    maxParticipants: {
      type: Number,
      min: 1,
    },
    cost: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    prerequisites: [String],
    learningObjectives: [String],
    materials: [MaterialSchema],
    isActive: {
      type: Boolean,
      default: true,
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

const EmployeeTrainingSchema = new Schema<IEmployeeTraining>(
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
    trainingId: {
      type: Schema.Types.ObjectId,
      ref: "Training",
      required: true,
      index: true,
    },
    assignedDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    certificateUrl: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'overdue', 'failed', 'expired'],
      default: 'assigned',
      index: true,
    },
    notes: {
      type: String,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for Training
TrainingSchema.index({ companyId: 1, category: 1 })
TrainingSchema.index({ companyId: 1, isActive: 1 })
TrainingSchema.index({ companyId: 1, targetDepartments: 1 })

// Indexes for EmployeeTraining
EmployeeTrainingSchema.index({ companyId: 1, employeeId: 1, status: 1 })
EmployeeTrainingSchema.index({ companyId: 1, trainingId: 1, status: 1 })
EmployeeTrainingSchema.index({ companyId: 1, dueDate: 1, status: 1 })
EmployeeTrainingSchema.index({ companyId: 1, expiryDate: 1, status: 1 })

// Compound index for unique training assignment per employee
EmployeeTrainingSchema.index({ companyId: 1, employeeId: 1, trainingId: 1 }, { unique: true })

export const Training = mongoose.models.Training || mongoose.model<ITraining>("Training", TrainingSchema)
export const EmployeeTraining = mongoose.models.EmployeeTraining || mongoose.model<IEmployeeTraining>("EmployeeTraining", EmployeeTrainingSchema)
