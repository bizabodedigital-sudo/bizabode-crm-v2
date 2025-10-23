import mongoose, { Schema, Document } from "mongoose"

export interface ITask extends Document {
  companyId: mongoose.Types.ObjectId
  title: string
  description: string
  type: "Follow-up" | "Call" | "Visit" | "Email" | "WhatsApp" | "Meeting" | "Review" | "Other"
  relatedTo: "Lead" | "Opportunity" | "Customer" | "Quote" | "Order" | "Invoice" | "General"
  relatedId?: mongoose.Types.ObjectId
  assignedTo: mongoose.Types.ObjectId
  createdBy: mongoose.Types.ObjectId
  dueDate: Date
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Pending" | "In Progress" | "Completed" | "Cancelled" | "Overdue"
  completedDate?: Date
  completedBy?: mongoose.Types.ObjectId
  notes?: string
  // Recurring task settings
  isRecurring: boolean
  recurringPattern?: "Daily" | "Weekly" | "Monthly" | "Quarterly"
  recurringInterval?: number
  nextDueDate?: Date
  // Reminder settings
  reminderDate?: Date
  reminderSent: boolean
  // Dependencies
  dependsOn?: mongoose.Types.ObjectId[]
  blocks?: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const TaskSchema = new Schema<ITask>(
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
    type: {
      type: String,
      enum: ["Follow-up", "Call", "Visit", "Email", "WhatsApp", "Meeting", "Review", "Other"],
      required: true,
      index: true,
    },
    relatedTo: {
      type: String,
      enum: ["Lead", "Opportunity", "Customer", "Quote", "Order", "Invoice", "General"],
      required: true,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled", "Overdue"],
      default: "Pending",
      index: true,
    },
    completedDate: Date,
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: String,
    // Recurring task settings
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringPattern: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Quarterly"],
    },
    recurringInterval: {
      type: Number,
      min: 1,
    },
    nextDueDate: Date,
    // Reminder settings
    reminderDate: Date,
    reminderSent: {
      type: Boolean,
      default: false,
    },
    // Dependencies
    dependsOn: [Schema.Types.ObjectId],
    blocks: [Schema.Types.ObjectId],
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
TaskSchema.index({ companyId: 1, assignedTo: 1, status: 1 })
TaskSchema.index({ companyId: 1, dueDate: 1, status: 1 })
TaskSchema.index({ companyId: 1, relatedTo: 1, relatedId: 1 })
TaskSchema.index({ companyId: 1, priority: 1, status: 1 })
TaskSchema.index({ companyId: 1, reminderDate: 1, reminderSent: 1 })

// Pre-save middleware to update status based on due date
TaskSchema.pre('save', function(next) {
  if (this.isModified('dueDate') || this.isModified('status')) {
    const now = new Date()
    if (this.dueDate < now && this.status === 'Pending') {
      this.status = 'Overdue'
    }
  }
  next()
})

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema)
