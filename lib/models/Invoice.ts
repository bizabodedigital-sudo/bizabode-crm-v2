import mongoose, { Schema, Document } from "mongoose"

export interface IInvoiceItem {
  itemId: mongoose.Types.ObjectId
  name: string
  description?: string
  quantity: number
  unitPrice: number
  discount?: number
  total: number
}

export interface IInvoice extends Document {
  companyId: mongoose.Types.ObjectId
  quoteId?: mongoose.Types.ObjectId
  invoiceNumber: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  items: IInvoiceItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  paidAmount: number
  dueDate: Date
  status: "draft" | "sent" | "paid" | "partial" | "overdue" | "cancelled"
  notes: string
  terms?: string
  pdfUrl?: string
  sentAt?: Date
  paidDate?: Date
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
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

const InvoiceSchema = new Schema<IInvoice>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    quoteId: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
    },
    invoiceNumber: {
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
    items: [InvoiceItemSchema],
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
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "partial", "overdue", "cancelled"],
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
    paidDate: Date,
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

export default mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema)

