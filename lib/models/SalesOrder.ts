import mongoose, { Schema, Document } from "mongoose"

export interface ISalesOrderItem {
  itemId: mongoose.Types.ObjectId
  name: string
  description?: string
  quantity: number
  unitPrice: number
  discount?: number
  total: number
}

export interface ISalesOrder extends Document {
  companyId: mongoose.Types.ObjectId
  orderNumber: string
  quoteId?: mongoose.Types.ObjectId
  customerId?: mongoose.Types.ObjectId
  customerName: string
  customerEmail: string
  customerPhone?: string
  customerAddress?: string
  items: ISalesOrderItem[]
  subtotal: number
  tax: number
  taxRate: number
  discount: number
  total: number
  orderDate: Date
  deliveryDate?: Date
  deliveryAddress?: string
  paymentTerms: "COD" | "Net 15" | "Net 30" | "Net 60" | "Prepaid" | "Credit"
  status: "Pending" | "Processing" | "Dispatched" | "Delivered" | "Cancelled"
  notes?: string
  createdBy: mongoose.Types.ObjectId
  assignedTo?: mongoose.Types.ObjectId
  // Delivery tracking
  driverName?: string
  driverPhone?: string
  trackingNumber?: string
  deliveryNotes?: string
  // Invoice reference
  invoiceId?: mongoose.Types.ObjectId
  // Timestamps
  processedAt?: Date
  dispatchedAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  createdAt: Date
  updatedAt: Date
}

const SalesOrderItemSchema = new Schema<ISalesOrderItem>(
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
      min: 0,
    },
  },
  { _id: false }
)

const SalesOrderSchema = new Schema<ISalesOrder>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    quoteId: {
      type: Schema.Types.ObjectId,
      ref: "Quote",
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
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
    items: [SalesOrderItemSchema],
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
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deliveryDate: Date,
    deliveryAddress: String,
    paymentTerms: {
      type: String,
      enum: ["COD", "Net 15", "Net 30", "Net 60", "Prepaid", "Credit"],
      default: "Net 30",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Dispatched", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    notes: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // Delivery tracking
    driverName: String,
    driverPhone: String,
    trackingNumber: String,
    deliveryNotes: String,
    // Invoice reference
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    // Timestamps
    processedAt: Date,
    dispatchedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient queries
SalesOrderSchema.index({ companyId: 1, status: 1 })
SalesOrderSchema.index({ companyId: 1, customerId: 1 })
SalesOrderSchema.index({ companyId: 1, orderDate: 1 })
SalesOrderSchema.index({ companyId: 1, assignedTo: 1 })
SalesOrderSchema.index({ orderNumber: 1 })

export default mongoose.models.SalesOrder || mongoose.model<ISalesOrder>("SalesOrder", SalesOrderSchema)
