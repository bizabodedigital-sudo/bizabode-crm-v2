import mongoose, { Schema, Document } from "mongoose"

export interface IOpportunity extends Document {
  companyId: mongoose.Types.ObjectId
  leadId?: mongoose.Types.ObjectId
  title: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  value: number
  stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
  probability: number
  expectedCloseDate: Date
  actualCloseDate?: Date
  assignedTo?: mongoose.Types.ObjectId
  notes: string
  lostReason?: string
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

const OpportunitySchema = new Schema<IOpportunity>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
    },
    title: {
      type: String,
      required: [true, "Opportunity title is required"],
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    stage: {
      type: String,
      enum: ["prospecting", "qualification", "proposal", "negotiation", "closed-won", "closed-lost"],
      default: "prospecting",
      index: true,
    },
    probability: {
      type: Number,
      min: 0,
      max: 100,
      default: 25,
    },
    expectedCloseDate: {
      type: Date,
      required: true,
    },
    actualCloseDate: {
      type: Date,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      default: "",
    },
    lostReason: {
      type: String,
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Opportunity || mongoose.model<IOpportunity>("Opportunity", OpportunitySchema)

