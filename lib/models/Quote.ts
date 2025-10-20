import mongoose, { Schema, Document } from "mongoose"

export interface IQuoteItem {
  itemId: mongoose.Types.ObjectId
  name: string
  description?: string
  quantity: number
  unitPrice: number
  discount?: number
  total: number
}

export interface IQuote extends Document {
  companyId: mongoose.Types.ObjectId
  opportunityId?: mongoose.Types.ObjectId
  quoteNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  items: IQuoteItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  validUntil: Date
  status: "draft" | "sent" | "accepted" | "rejected" | "expired"
  notes: string
  terms?: string
  pdfUrl?: string
  sentAt?: Date
  acceptedAt?: Date
  rejectedAt?: Date
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const QuoteItemSchema = new Schema<IQuoteItem>(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: String,
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
)

const QuoteSchema = new Schema<IQuote>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    opportunityId: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
    },
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: String,
    customerAddress: String,
    items: [QuoteItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      default: 10,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "accepted", "rejected", "expired"],
      default: "draft",
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
    terms: String,
    pdfUrl: String,
    sentAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
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

export default mongoose.models.Quote || mongoose.model<IQuote>("Quote", QuoteSchema)

