import mongoose, { Schema, Document } from "mongoose"

export interface IPayment extends Document {
  companyId: mongoose.Types.ObjectId
  invoiceId: mongoose.Types.ObjectId
  amount: number
  method: "cash" | "card" | "bank-transfer" | "check" | "other"
  reference: string
  notes: string
  receiptUrl?: string
  processedBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      enum: ["cash", "card", "bank-transfer", "check", "other"],
      required: true,
    },
    reference: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    receiptUrl: String,
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema)

